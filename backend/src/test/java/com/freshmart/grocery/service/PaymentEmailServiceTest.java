package com.freshmart.grocery.service;

import com.freshmart.grocery.model.Address;
import com.freshmart.grocery.model.DeliverySlot;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.OrderItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PaymentEmailServiceTest {

    private JavaMailSender mailSender;
    private PaymentEmailService paymentEmailService;

    @BeforeEach
    public void setUp() {
        mailSender = mock(JavaMailSender.class);
        paymentEmailService = new PaymentEmailService(mailSender);
        ReflectionTestUtils.setField(paymentEmailService, "emailEnabled", true);
        ReflectionTestUtils.setField(paymentEmailService, "from", "smuneer3779@gmail.com");
    }

    private Order createSampleOrder() {
        Order order = new Order();
        order.setId("ord_test_01");
        order.setOrderNumber("FM-12345678");
        order.setCustomerName("Shaik Muneer");
        order.setCustomerEmail("smuneer3779@gmail.com");
        order.setSubtotal(400.0);
        order.setTax(20.0);
        order.setDeliveryFee(30.0);
        order.setTotal(450.0);
        order.setPaymentMethod("ONLINE_RAZORPAY");

        OrderItem item = new OrderItem("p1", "Fresh Organic Apples", "", "kg", 120.0, 2);
        order.setItems(List.of(item));

        Address addr = new Address("addr_1", "Shaik Muneer", "+91 9900112233", "123 Main St", "Apt 4", "Bangalore", "Karnataka", "560001", "", true);
        order.setDeliveryAddress(addr);

        DeliverySlot slot = new DeliverySlot("slot_1", "Early Morning (07:00 AM - 10:00 AM)", "STANDARD", 0.0, "Tomorrow");
        order.setDeliverySlot(slot);
        return order;
    }

    @Test
    public void testSendPaymentConfirmationSuccess() {
        Order order = createSampleOrder();

        paymentEmailService.sendPaymentConfirmation(order, "pay_rzp_test_12345");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sentMsg = captor.getValue();
        assertEquals("smuneer3779@gmail.com", sentMsg.getFrom());
        assertNotNull(sentMsg.getTo());
        assertEquals("smuneer3779@gmail.com", sentMsg.getTo()[0]);
        assertTrue(sentMsg.getSubject().contains("FM-12345678"));
        assertTrue(sentMsg.getText().contains("Shaik Muneer"));
        assertTrue(sentMsg.getText().contains("450.00"));
        assertTrue(sentMsg.getText().contains("pay_rzp_test_12345"));
        assertTrue(sentMsg.getText().contains("Fresh Organic Apples"));
    }

    @Test
    public void testSendOrderConfirmationSuccess() {
        Order order = createSampleOrder();
        order.setPaymentMethod("CASH_ON_DELIVERY");

        paymentEmailService.sendOrderConfirmation(order);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sentMsg = captor.getValue();
        assertTrue(sentMsg.getSubject().contains("Order Confirmed"));
        assertTrue(sentMsg.getText().contains("CASH ON DELIVERY"));
        assertTrue(sentMsg.getText().contains("Fresh Organic Apples"));
    }

    @Test
    public void testSendOrderStatusUpdateSuccess() {
        Order order = createSampleOrder();
        order.setStatus("OUT_FOR_DELIVERY");
        order.setDeliveryPartnerName("Vikram Singh");
        order.setDeliveryPartnerPhone("+91 91234 56789");
        order.setEstimatedMinutesRemaining(20);

        paymentEmailService.sendOrderStatusUpdate(order, "PACKING", "OUT_FOR_DELIVERY", "Driver is on the way!");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sentMsg = captor.getValue();
        assertTrue(sentMsg.getSubject().contains("Out For Delivery"));
        assertTrue(sentMsg.getText().contains("CURRENT STATUS: Out For Delivery"));
        assertTrue(sentMsg.getText().contains("Driver is on the way!"));
        assertTrue(sentMsg.getText().contains("Vikram Singh"));
    }

    @Test
    public void testSkippedWhenMissingRecipient() {
        Order order = createSampleOrder();
        order.setCustomerEmail(null);

        paymentEmailService.sendPaymentConfirmation(order, "pay_123");
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    public void testSkippedWhenDisabled() {
        ReflectionTestUtils.setField(paymentEmailService, "emailEnabled", false);

        Order order = createSampleOrder();

        paymentEmailService.sendPaymentConfirmation(order, "pay_123");
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
