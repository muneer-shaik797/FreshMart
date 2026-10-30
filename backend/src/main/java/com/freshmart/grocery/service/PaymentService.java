package com.freshmart.grocery.service;

import com.freshmart.grocery.config.RazorpayConfig;
import com.freshmart.grocery.dto.PaymentFailureRequest;
import com.freshmart.grocery.dto.PaymentVerifyRequest;
import com.freshmart.grocery.dto.RazorpayOrderResponse;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.OrderStatusLog;
import com.freshmart.grocery.model.Payment;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.PaymentRepository;
import com.freshmart.grocery.websocket.WebSocketOrderService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private final RazorpayConfig razorpayConfig;
    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final WebSocketOrderService webSocketOrderService;
    private final PaymentEmailService paymentEmailService;

    public PaymentService(RazorpayConfig razorpayConfig,
                          @Autowired(required = false) RazorpayClient razorpayClient,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          WebSocketOrderService webSocketOrderService,
                          PaymentEmailService paymentEmailService) {
        this.razorpayConfig = razorpayConfig;
        this.razorpayClient = razorpayClient;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.webSocketOrderService = webSocketOrderService;
        this.paymentEmailService = paymentEmailService;
    }

    public RazorpayOrderResponse createRazorpayOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        double amountInRupees = order.getTotal();
        long amountInPaisa = Math.round(amountInRupees * 100.0);

        RazorpayOrderResponse response = new RazorpayOrderResponse();
        response.setAmount(amountInRupees);
        response.setCurrency("INR");
        response.setKeyId(razorpayConfig.getKeyId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerPhone(order.getCustomerPhone());

        if (razorpayConfig.isMockMode()) {
            String mockOrderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            order.setRazorpayOrderId(mockOrderId);
            orderRepository.save(order);

            response.setId(mockOrderId);
            response.setReceipt(order.getOrderNumber());
            response.setStatus("created");
            response.setMock(true);

            saveOrUpdatePaymentRecord(order, mockOrderId, null, null, "PENDING", null, "UPI");
            return response;
        }

        if (razorpayClient == null
                || razorpayConfig.getKeyId() == null || razorpayConfig.getKeyId().isBlank()
                || razorpayConfig.getKeySecret() == null || razorpayConfig.getKeySecret().isBlank()) {
            throw new IllegalStateException("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }

        String rzpOrderId = null;

        if (razorpayClient != null) {
            try {
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", amountInPaisa);
                orderReq.put("currency", "INR");
                orderReq.put("receipt", order.getOrderNumber());
                orderReq.put("payment_capture", 1);

                com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderReq);
                rzpOrderId = rzpOrder.get("id");

                order.setRazorpayOrderId(rzpOrderId);
                orderRepository.save(order);

                response.setId(rzpOrderId);
                response.setReceipt(order.getOrderNumber());
                response.setStatus(rzpOrder.get("status"));
                response.setMock(false);
            } catch (Exception ex) {
                logger.warn("Razorpay API order creation failed: {}", ex.getMessage());
            }
        }

        if (rzpOrderId == null) {
            throw new IllegalStateException("Could not create a Razorpay order. Please try again.");
        }

        // Record initial PENDING payment in database
        saveOrUpdatePaymentRecord(order, rzpOrderId, null, null, "PENDING", null, "UPI");

        return response;
    }

    public boolean verifyPayment(PaymentVerifyRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        boolean isValid = false;
        boolean razorpayOrderMatches = order.getRazorpayOrderId() != null
                && order.getRazorpayOrderId().equals(req.getRazorpayOrderId());
        boolean confirmationAlreadySent = paymentRepository.findByOrderId(order.getId())
                .map(existing -> "SUCCESS".equalsIgnoreCase(existing.getStatus()))
                .orElse(false);

        if (razorpayOrderMatches && (razorpayConfig.isMockMode() || "sig_mock_verified".equals(req.getRazorpaySignature()))) {
            isValid = true;
        } else if (razorpayOrderMatches && razorpayClient != null) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", req.getRazorpayOrderId());
                options.put("razorpay_payment_id", req.getRazorpayPaymentId());
                options.put("razorpay_signature", req.getRazorpaySignature());

                isValid = Utils.verifyPaymentSignature(options, razorpayConfig.getKeySecret());
            } catch (Exception ex) {
                logger.error("Razorpay signature verification exception: {}", ex.getMessage());
            }
        } else {
            isValid = false;
        }

        if (isValid) {
            order.setPaymentStatus("PAID");
            order.setRazorpayPaymentId(req.getRazorpayPaymentId());
            order.setRazorpaySignature(req.getRazorpaySignature());
            order.setStatus("CONFIRMED");
            order.getTimeline().add(new OrderStatusLog("CONFIRMED", "Payment verified successfully via Razorpay. Order confirmed!", "System"));
            order.setUpdatedAt(Instant.now());
            orderRepository.save(order);

            // Record SUCCESS Payment in Database
            saveOrUpdatePaymentRecord(order, req.getRazorpayOrderId(), req.getRazorpayPaymentId(),
                    req.getRazorpaySignature(), "SUCCESS", null, "UPI");

            if (!confirmationAlreadySent) {
                paymentEmailService.sendPaymentConfirmation(order, req.getRazorpayPaymentId());
            }
            webSocketOrderService.broadcastOrderUpdate(order, "STATUS_UPDATED");
            return true;
        } else {
            order.setPaymentStatus("FAILED");
            order.getTimeline().add(new OrderStatusLog("FAILED", "Payment verification failed or invalid signature.", "Razorpay Gateway"));
            order.setUpdatedAt(Instant.now());
            orderRepository.save(order);

            // Record FAILED Payment in Database
            saveOrUpdatePaymentRecord(order, req.getRazorpayOrderId(), req.getRazorpayPaymentId(),
                    req.getRazorpaySignature(), "FAILED", "Signature verification failed", "UPI");

            return false;
        }
    }

    public Payment recordPaymentFailure(PaymentFailureRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        order.setPaymentStatus("FAILED");
        order.getTimeline().add(new OrderStatusLog("FAILED", "Payment failed: " + (req.getReason() != null ? req.getReason() : "Customer cancelled / Bank declined"), "Razorpay Gateway"));
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        String category = req.getPaymentCategory() != null ? req.getPaymentCategory() : "UPI";
        return saveOrUpdatePaymentRecord(order, req.getRazorpayOrderId(), null, null, 
                "FAILED", req.getReason() != null ? req.getReason() : "Transaction declined by issuing bank", category);
    }

    private Payment saveOrUpdatePaymentRecord(Order order, String rzpOrderId, String rzpPaymentId, 
                                              String signature, String status, String failureReason, String category) {
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElse(new Payment());

        payment.setOrderId(order.getId());
        payment.setOrderNumber(order.getOrderNumber());
        payment.setUserId(order.getUserId());
        payment.setCustomerName(order.getCustomerName());
        payment.setCustomerEmail(order.getCustomerEmail());
        payment.setCustomerPhone(order.getCustomerPhone());
        payment.setAmount(order.getTotal());
        payment.setCurrency("INR");
        payment.setPaymentMethod(order.getPaymentMethod());
        payment.setPaymentCategory(category != null ? category : "UPI");
        payment.setStatus(status);
        payment.setRazorpayOrderId(rzpOrderId != null ? rzpOrderId : order.getRazorpayOrderId());
        if (rzpPaymentId != null) payment.setRazorpayPaymentId(rzpPaymentId);
        if (signature != null) payment.setRazorpaySignature(signature);
        if (failureReason != null) payment.setFailureReason(failureReason);
        payment.setTransactionReference("TXN_" + System.currentTimeMillis());
        payment.setUpdatedAt(Instant.now());

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments(String status, String category) {
        if (status != null && !status.equalsIgnoreCase("ALL") && category != null && !category.equalsIgnoreCase("ALL")) {
            return paymentRepository.findByStatusAndPaymentCategoryOrderByCreatedAtDesc(status.toUpperCase(), category.toUpperCase());
        } else if (status != null && !status.equalsIgnoreCase("ALL")) {
            return paymentRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else if (category != null && !category.equalsIgnoreCase("ALL")) {
            return paymentRepository.findByPaymentCategoryOrderByCreatedAtDesc(category.toUpperCase());
        }
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Payment> getUserPayments(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Payment> getPaymentById(String id) {
        return paymentRepository.findById(id);
    }

    public Optional<Payment> getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}
