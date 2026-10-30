package com.freshmart.grocery.service;

import com.freshmart.grocery.dto.CouponVerifyRequest;
import com.freshmart.grocery.dto.CouponVerifyResponse;
import com.freshmart.grocery.dto.OrderRequest;
import com.freshmart.grocery.dto.OrderStatusUpdateRequest;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.OrderItem;
import com.freshmart.grocery.model.OrderStatusLog;
import com.freshmart.grocery.model.User;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.UserRepository;
import com.freshmart.grocery.websocket.WebSocketOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final CouponService couponService;
    private final UserRepository userRepository;
    private final WebSocketOrderService webSocketOrderService;
    private final PaymentEmailService paymentEmailService;

    public OrderService(OrderRepository orderRepository,
                        ProductService productService,
                        CouponService couponService,
                        UserRepository userRepository,
                        WebSocketOrderService webSocketOrderService,
                        PaymentEmailService paymentEmailService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.couponService = couponService;
        this.userRepository = userRepository;
        this.webSocketOrderService = webSocketOrderService;
        this.paymentEmailService = paymentEmailService;
    }

    public Order createOrder(String userId, OrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Deduct inventory stock
        for (OrderItem item : req.getItems()) {
            productService.deductStock(item.getProductId(), item.getQuantity());
        }

        double subtotal = req.getItems().stream()
                .mapToDouble(OrderItem::getTotal)
                .sum();

        double discount = 0.0;
        String couponCode = null;

        if (req.getCouponCode() != null && !req.getCouponCode().trim().isEmpty()) {
            CouponVerifyResponse couponRes = couponService.verifyCoupon(new CouponVerifyRequest(req.getCouponCode(), subtotal));
            if (couponRes.isValid()) {
                discount = couponRes.getDiscountAmount();
                couponCode = couponRes.getCode();
            }
        }

        double deliveryFee = (subtotal >= 499.0) ? 0.0 : 40.0;
        if (req.getDeliverySlot() != null && req.getDeliverySlot().getExtraFee() > 0) {
            deliveryFee += req.getDeliverySlot().getExtraFee();
        }

        double taxableAmount = Math.max(0.0, subtotal - discount);
        double tax = Math.round(taxableAmount * 0.05 * 100.0) / 100.0; // 5% GST on grocery
        double total = Math.round((taxableAmount + deliveryFee + tax) * 100.0) / 100.0;

        Order order = new Order();
        order.setOrderNumber("FM-" + System.currentTimeMillis() % 100000000);
        order.setUserId(userId);
        order.setCustomerName(user.getName());
        String targetEmail = (req.getCustomerEmail() != null && !req.getCustomerEmail().isBlank())
                ? req.getCustomerEmail().trim()
                : user.getEmail();
        order.setCustomerEmail(targetEmail);
        order.setCustomerPhone(user.getPhone() != null ? user.getPhone() : req.getDeliveryAddress().getPhone());
        order.setItems(req.getItems());
        order.setDeliveryAddress(req.getDeliveryAddress());
        order.setDeliverySlot(req.getDeliverySlot());
        order.setDeliveryNotes(req.getDeliveryNotes());
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "ONLINE_RAZORPAY");
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setCouponCode(couponCode);
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotal(total);

        // Initial status
        order.setStatus("PLACED");
        order.setPaymentStatus(order.getPaymentMethod().equals("CASH_ON_DELIVERY") ? "COD_PENDING" : "PENDING");

        order.getTimeline().add(new OrderStatusLog("PLACED", "Order successfully received at FreshMart fulfillment hub.", "Customer"));

        Order saved = orderRepository.save(order);
        webSocketOrderService.broadcastOrderUpdate(saved, "ORDER_CREATED");

        if ("CASH_ON_DELIVERY".equalsIgnoreCase(saved.getPaymentMethod())) {
            paymentEmailService.sendOrderConfirmation(saved);
        }

        return saved;
    }

    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
    }

    public Order updateOrderStatus(String orderId, OrderStatusUpdateRequest req, String updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        String oldStatus = order.getStatus();
        String newStatus = req.getStatus().toUpperCase();
        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());

        String desc = req.getDescription();
        if (desc == null || desc.trim().isEmpty()) {
            switch (newStatus) {
                case "CONFIRMED":
                    desc = "Order has been confirmed and forwarded to the warehouse.";
                    break;
                case "PACKING":
                    desc = "Items are being picked fresh and packed with eco-friendly insulated packaging.";
                    break;
                case "OUT_FOR_DELIVERY":
                    desc = "Delivery partner " + order.getDeliveryPartnerName() + " has picked up your order and is on the way.";
                    break;
                case "DELIVERED":
                    desc = "Order successfully delivered to your doorstep. Enjoy your fresh groceries!";
                    if ("COD_PENDING".equals(order.getPaymentStatus())) {
                        order.setPaymentStatus("PAID");
                    }
                    break;
                case "CANCELLED":
                    desc = "Order has been cancelled.";
                    break;
                default:
                    desc = "Order status updated to " + newStatus;
            }
        }

        if (req.getDriverLat() != null) order.setDriverLat(req.getDriverLat());
        if (req.getDriverLng() != null) order.setDriverLng(req.getDriverLng());
        if (req.getEstimatedMinutesRemaining() != null) {
            order.setEstimatedMinutesRemaining(req.getEstimatedMinutesRemaining());
        }

        order.getTimeline().add(new OrderStatusLog(newStatus, desc, updatedBy));

        Order saved = orderRepository.save(order);
        webSocketOrderService.broadcastOrderUpdate(saved, "STATUS_UPDATED");

        if (!newStatus.equalsIgnoreCase(oldStatus)) {
            paymentEmailService.sendOrderStatusUpdate(saved, oldStatus, newStatus, desc);
        }

        return saved;
    }

    public Order cancelOrder(String orderId, String userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!order.getUserId().equals(userId) && !userId.equals("admin")) {
            throw new IllegalStateException("You are not authorized to cancel this order");
        }

        if ("DELIVERED".equals(order.getStatus()) || "OUT_FOR_DELIVERY".equals(order.getStatus())) {
            throw new IllegalStateException("Order cannot be cancelled as it is already " + order.getStatus());
        }

        String oldStatus = order.getStatus();
        order.setStatus("CANCELLED");
        order.setUpdatedAt(Instant.now());
        order.getTimeline().add(new OrderStatusLog("CANCELLED", "Order cancelled. Reason: " + (reason != null ? reason : "Customer requested"), "Customer"));

        // Restore inventory
        for (OrderItem item : order.getItems()) {
            productService.restoreStock(item.getProductId(), item.getQuantity());
        }

        Order saved = orderRepository.save(order);
        webSocketOrderService.broadcastOrderUpdate(saved, "CANCELLED");

        if (!"CANCELLED".equalsIgnoreCase(oldStatus)) {
            paymentEmailService.sendOrderStatusUpdate(saved, oldStatus, "CANCELLED", "Order cancelled: " + (reason != null ? reason : "Customer requested"));
        }

        return saved;
    }

    /**
     * Advances simulation coordinates of delivery driver along with realistic minutes count
     */
    public Order simulateDriverMovement(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!"OUT_FOR_DELIVERY".equals(order.getStatus())) {
            // Auto advance to OUT_FOR_DELIVERY
            OrderStatusUpdateRequest updateReq = new OrderStatusUpdateRequest();
            updateReq.setStatus("OUT_FOR_DELIVERY");
            updateReq.setEstimatedMinutesRemaining(25);
            return updateOrderStatus(orderId, updateReq, "Simulation");
        }

        // Slight movement towards destination
        double latStep = (Math.random() - 0.48) * 0.002;
        double lngStep = (Math.random() - 0.48) * 0.002;
        order.setDriverLat(order.getDriverLat() + latStep);
        order.setDriverLng(order.getDriverLng() + lngStep);

        int remaining = Math.max(3, order.getEstimatedMinutesRemaining() - 4);
        order.setEstimatedMinutesRemaining(remaining);
        order.setUpdatedAt(Instant.now());

        if (remaining <= 3) {
            OrderStatusUpdateRequest finishReq = new OrderStatusUpdateRequest();
            finishReq.setStatus("DELIVERED");
            return updateOrderStatus(orderId, finishReq, "Simulation");
        }

        Order saved = orderRepository.save(order);
        webSocketOrderService.broadcastOrderUpdate(saved, "DRIVER_MOVED");
        return saved;
    }
}
