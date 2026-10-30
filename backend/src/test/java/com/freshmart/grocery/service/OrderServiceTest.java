package com.freshmart.grocery.service;

import com.freshmart.grocery.dto.OrderRequest;
import com.freshmart.grocery.dto.OrderStatusUpdateRequest;
import com.freshmart.grocery.model.Address;
import com.freshmart.grocery.model.DeliverySlot;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.OrderItem;
import com.freshmart.grocery.model.User;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.UserRepository;
import com.freshmart.grocery.websocket.WebSocketOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class OrderServiceTest {

    private OrderRepository orderRepository;
    private ProductService productService;
    private CouponService couponService;
    private UserRepository userRepository;
    private WebSocketOrderService webSocketOrderService;
    private PaymentEmailService paymentEmailService;
    private OrderService orderService;

    @BeforeEach
    public void setUp() {
        orderRepository = mock(OrderRepository.class);
        productService = mock(ProductService.class);
        couponService = mock(CouponService.class);
        userRepository = mock(UserRepository.class);
        webSocketOrderService = mock(WebSocketOrderService.class);
        paymentEmailService = mock(PaymentEmailService.class);

        orderService = new OrderService(
                orderRepository,
                productService,
                couponService,
                userRepository,
                webSocketOrderService,
                paymentEmailService
        );
    }

    @Test
    public void testCreateOrderWithCashOnDeliverySendsEmail() {
        User user = new User("Shaik Muneer", "smuneer3779@gmail.com", "pass", "ROLE_CUSTOMER", "+91 9900112233");
        user.setId("user_123");
        when(userRepository.findById("user_123")).thenReturn(Optional.of(user));

        OrderRequest req = new OrderRequest();
        OrderItem item = new OrderItem("p1", "Milk", "", "L", 50.0, 2);
        req.setItems(List.of(item));
        req.setPaymentMethod("CASH_ON_DELIVERY");
        req.setDeliveryAddress(new Address("a1", "Shaik Muneer", "+91 9900112233", "123 St", "", "Bangalore", "KA", "560001", "", true));
        req.setDeliverySlot(new DeliverySlot("s1", "Morning", "STANDARD", 0.0, "Tomorrow"));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order created = orderService.createOrder("user_123", req);

        assertNotNull(created);
        assertEquals("smuneer3779@gmail.com", created.getCustomerEmail());
        verify(paymentEmailService, times(1)).sendOrderConfirmation(created);
    }

    @Test
    public void testUpdateOrderStatusSendsStatusUpdateEmail() {
        Order order = new Order();
        order.setId("ord_123");
        order.setOrderNumber("FM-99999");
        order.setCustomerName("Shaik Muneer");
        order.setCustomerEmail("smuneer3779@gmail.com");
        order.setStatus("PLACED");

        when(orderRepository.findById("ord_123")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest();
        req.setStatus("PACKING");
        req.setDescription("Groceries are being packed with care.");

        Order updated = orderService.updateOrderStatus("ord_123", req, "Admin");

        assertEquals("PACKING", updated.getStatus());
        verify(paymentEmailService, times(1)).sendOrderStatusUpdate(eq(order), eq("PLACED"), eq("PACKING"), eq("Groceries are being packed with care."));
    }
}

