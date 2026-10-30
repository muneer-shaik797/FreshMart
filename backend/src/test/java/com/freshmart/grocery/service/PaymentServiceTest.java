package com.freshmart.grocery.service;

import com.freshmart.grocery.config.RazorpayConfig;
import com.freshmart.grocery.dto.PaymentVerifyRequest;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.Payment;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.PaymentRepository;
import com.freshmart.grocery.websocket.WebSocketOrderService;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PaymentServiceTest {

    private RazorpayConfig razorpayConfig;
    private RazorpayClient razorpayClient;
    private OrderRepository orderRepository;
    private PaymentRepository paymentRepository;
    private WebSocketOrderService webSocketOrderService;
    private PaymentEmailService paymentEmailService;
    private PaymentService paymentService;

    @BeforeEach
    public void setUp() {
        razorpayConfig = mock(RazorpayConfig.class);
        razorpayClient = mock(RazorpayClient.class);
        orderRepository = mock(OrderRepository.class);
        paymentRepository = mock(PaymentRepository.class);
        webSocketOrderService = mock(WebSocketOrderService.class);
        paymentEmailService = mock(PaymentEmailService.class);

        when(razorpayConfig.getKeyId()).thenReturn("rzp_test_ThlaM0mgWVo6g0");
        when(razorpayConfig.getKeySecret()).thenReturn("dqSKmUpZHBZ1KNBzFJ0V9iIq");
        when(razorpayConfig.isMockMode()).thenReturn(false);

        paymentService = new PaymentService(
                razorpayConfig,
                razorpayClient,
                orderRepository,
                paymentRepository,
                webSocketOrderService,
                paymentEmailService
        );
    }

    @Test
    public void testVerifyPaymentSendsConfirmationEmail() {
        Order order = new Order();
        order.setId("order_id_123");
        order.setOrderNumber("FM-88990011");
        order.setCustomerName("Shaik Muneer");
        order.setCustomerEmail("smuneer3779@gmail.com");
        order.setRazorpayOrderId("order_Tu9O2ihufwUe5d");
        order.setTotal(350.0);

        when(orderRepository.findById("order_id_123")).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId("order_id_123")).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentVerifyRequest verifyReq = new PaymentVerifyRequest(
                "order_id_123",
                "order_Tu9O2ihufwUe5d",
                "pay_test_001",
                "sig_mock_verified"
        );

        boolean result = paymentService.verifyPayment(verifyReq);

        assertTrue(result, "Payment should verify successfully");
        verify(paymentEmailService, times(1)).sendPaymentConfirmation(order, "pay_test_001");
        verify(orderRepository, times(1)).save(order);
    }
}

