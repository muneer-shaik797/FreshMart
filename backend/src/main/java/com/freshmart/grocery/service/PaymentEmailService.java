package com.freshmart.grocery.service;

import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.OrderItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class PaymentEmailService {

    private static final Logger log = LoggerFactory.getLogger(PaymentEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.notifications.email.enabled:${EMAIL_NOTIFICATIONS_ENABLED:true}}")
    private boolean emailEnabled;

    @Value("${app.mail.from:${app.notifications.email.from:${spring.mail.username:${MAIL_FROM:smuneer3779@gmail.com}}}}")
    private String from;

    public PaymentEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Asynchronously sends payment & order confirmation email immediately after payment verification.
     */
    @Async("emailTaskExecutor")
    public void sendPaymentConfirmation(Order order, String paymentId) {
        if (!isNotificationAllowed(order)) {
            return;
        }

        String recipient = order.getCustomerEmail().trim();
        String sender = getSenderEmail();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(recipient);
            if (!sender.equalsIgnoreCase(recipient)) {
                message.setBcc(sender);
            }
            message.setSubject("Payment Confirmed — FreshMart Order #" + order.getOrderNumber());

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(getCustomerDisplayName(order)).append(",\n\n");
            body.append("Thank you for your purchase! Your payment has been successfully verified, and your order is confirmed.\n\n");

            appendOrderAndPaymentDetails(body, order, "PAID", paymentId);
            appendProductsList(body, order);
            appendDeliveryDetails(body, order);

            body.append("You can track your order live in real-time through your FreshMart account.\n\n");
            body.append("Warm regards,\n");
            body.append("FreshMart Supermarket Team\n");

            message.setText(body.toString());
            mailSender.send(message);
            log.info("Payment confirmation email successfully sent to {} for order {}", recipient, order.getOrderNumber());
        } catch (MailException ex) {
            log.error("Mail server error sending payment confirmation for order {}: {}", order.getOrderNumber(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error sending payment confirmation for order {}: {}", order.getOrderNumber(), ex.getMessage(), ex);
        }
    }

    /**
     * Asynchronously sends order confirmation email when an order is placed (e.g. Cash On Delivery).
     */
    @Async("emailTaskExecutor")
    public void sendOrderConfirmation(Order order) {
        if (!isNotificationAllowed(order)) {
            return;
        }

        String recipient = order.getCustomerEmail().trim();
        String sender = getSenderEmail();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(recipient);
            if (!sender.equalsIgnoreCase(recipient)) {
                message.setBcc(sender);
            }
            message.setSubject("Order Confirmed — FreshMart Order #" + order.getOrderNumber());

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(getCustomerDisplayName(order)).append(",\n\n");
            body.append("We have received your order! It is now being prepared for delivery.\n\n");

            String paymentStatusDesc = "CASH_ON_DELIVERY".equalsIgnoreCase(order.getPaymentMethod())
                    ? "CASH ON DELIVERY (Pay upon delivery)"
                    : order.getPaymentStatus();

            appendOrderAndPaymentDetails(body, order, paymentStatusDesc, order.getRazorpayPaymentId());
            appendProductsList(body, order);
            appendDeliveryDetails(body, order);

            body.append("You can track your order live in real-time through your FreshMart account.\n\n");
            body.append("Warm regards,\n");
            body.append("FreshMart Supermarket Team\n");

            message.setText(body.toString());
            mailSender.send(message);
            log.info("Order confirmation email successfully sent to {} for order {}", recipient, order.getOrderNumber());
        } catch (MailException ex) {
            log.error("Mail server error sending order confirmation for order {}: {}", order.getOrderNumber(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error sending order confirmation for order {}: {}", order.getOrderNumber(), ex.getMessage(), ex);
        }
    }

    /**
     * Asynchronously sends an order status update email whenever the admin modifies the status.
     */
    @Async("emailTaskExecutor")
    public void sendOrderStatusUpdate(Order order, String previousStatus, String newStatus, String description) {
        if (!isNotificationAllowed(order)) {
            return;
        }

        String recipient = order.getCustomerEmail().trim();
        String sender = getSenderEmail();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(recipient);
            if (!sender.equalsIgnoreCase(recipient)) {
                message.setBcc(sender);
            }
            message.setSubject("Order #" + order.getOrderNumber() + " Status Update: " + formatStatusName(newStatus));

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(getCustomerDisplayName(order)).append(",\n\n");
            body.append("Your FreshMart order #").append(order.getOrderNumber()).append(" status has been updated!\n\n");

            body.append("==================================================\n");
            body.append("CURRENT STATUS: ").append(formatStatusName(newStatus)).append("\n");
            body.append("==================================================\n");
            if (description != null && !description.isBlank()) {
                body.append("Update: ").append(description).append("\n\n");
            }

            if ("OUT_FOR_DELIVERY".equalsIgnoreCase(newStatus)) {
                body.append("DELIVERY PARTNER DETAILS:\n");
                body.append(" • Partner Name:  ").append(order.getDeliveryPartnerName() != null ? order.getDeliveryPartnerName() : "Assigned Driver").append("\n");
                body.append(" • Partner Phone: ").append(order.getDeliveryPartnerPhone() != null ? order.getDeliveryPartnerPhone() : "Contact via app").append("\n");
                if (order.getEstimatedMinutesRemaining() > 0) {
                    body.append(" • Estimated ETA: ").append(order.getEstimatedMinutesRemaining()).append(" minutes remaining\n");
                }
                body.append("\n");
            } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
                body.append("Your fresh groceries have been successfully delivered. We hope you enjoy them!\n\n");
            }

            appendProductsList(body, order);
            appendOrderAndPaymentDetails(body, order, order.getPaymentStatus(), order.getRazorpayPaymentId());
            appendDeliveryDetails(body, order);

            body.append("Track live updates at: http://localhost:5173/track-order/").append(order.getId()).append("\n\n");
            body.append("Thank you for shopping with FreshMart!\n");
            body.append("FreshMart Supermarket Team\n");

            message.setText(body.toString());
            mailSender.send(message);
            log.info("Order status update ({}) email successfully sent to {} for order {}", newStatus, recipient, order.getOrderNumber());
        } catch (MailException ex) {
            log.error("Mail server error sending status update for order {}: {}", order.getOrderNumber(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error sending status update for order {}: {}", order.getOrderNumber(), ex.getMessage(), ex);
        }
    }

    /**
     * Synchronous/diagnostic test email delivery for admin/monitoring.
     */
    public boolean sendTestEmail(String toEmail) {
        String sender = getSenderEmail();
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(toEmail.trim());
            message.setSubject("FreshMart SMTP Test Notification");
            message.setText("Hello,\n\nThis is a test notification confirming that the FreshMart email notification service is properly configured and functioning.\n\nBest regards,\nFreshMart Team");
            mailSender.send(message);
            log.info("Test email successfully sent to {}", toEmail);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send test email to {}: {}", toEmail, ex.getMessage(), ex);
            return false;
        }
    }

    public boolean resendOrderConfirmation(Order order, String targetEmail) {
        String sender = getSenderEmail();
        String recipient = (targetEmail != null && !targetEmail.isBlank())
                ? targetEmail.trim()
                : (order.getCustomerEmail() != null ? order.getCustomerEmail().trim() : sender);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(recipient);
            message.setSubject("Payment & Order Confirmed — FreshMart Order #" + order.getOrderNumber());

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(getCustomerDisplayName(order)).append(",\n\n");
            body.append("Here are your confirmed FreshMart order and payment details:\n\n");

            appendOrderAndPaymentDetails(body, order, order.getPaymentStatus() != null ? order.getPaymentStatus() : "PAID", order.getRazorpayPaymentId());
            appendProductsList(body, order);
            appendDeliveryDetails(body, order);

            body.append("You can track your order live in real-time through your FreshMart account.\n\n");
            body.append("Warm regards,\n");
            body.append("FreshMart Supermarket Team\n");

            message.setText(body.toString());
            mailSender.send(message);
            log.info("Order confirmation successfully sent to {} for order {}", recipient, order.getOrderNumber());
            return true;
        } catch (Exception ex) {
            log.error("Failed to resend confirmation email for order {}: {}", order.getOrderNumber(), ex.getMessage(), ex);
            return false;
        }
    }

    private boolean isNotificationAllowed(Order order) {
        if (!emailEnabled) {
            log.info("Payment email notifications disabled (EMAIL_NOTIFICATIONS_ENABLED=false). Order: {}", order.getOrderNumber());
            return false;
        }
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            log.warn("Email skipped: recipient email is missing for order {}", order.getOrderNumber());
            return false;
        }
        return true;
    }

    private String getSenderEmail() {
        return (from != null && !from.isBlank()) ? from.trim() : "smuneer3779@gmail.com";
    }

    private String getCustomerDisplayName(Order order) {
        return (order.getCustomerName() != null && !order.getCustomerName().isBlank())
                ? order.getCustomerName()
                : "Valued Customer";
    }

    private String formatStatusName(String status) {
        if (status == null) return "UPDATED";
        switch (status.toUpperCase()) {
            case "PLACED": return "Order Placed";
            case "CONFIRMED": return "Order Confirmed";
            case "PACKING": return "Items Packing & Quality Check";
            case "OUT_FOR_DELIVERY": return "Out For Delivery";
            case "DELIVERED": return "Delivered";
            case "CANCELLED": return "Cancelled";
            default: return status;
        }
    }

    private void appendOrderAndPaymentDetails(StringBuilder body, Order order, String paymentStatusDesc, String paymentRef) {
        body.append("==================================================\n");
        body.append("ORDER & PAYMENT DETAILS\n");
        body.append("==================================================\n");
        body.append("Order Number:     ").append(order.getOrderNumber()).append("\n");
        body.append("Payment Method:   ").append(formatPaymentMethod(order.getPaymentMethod())).append("\n");
        body.append("Payment Status:   ").append(paymentStatusDesc != null ? paymentStatusDesc : "PENDING").append("\n");
        if (paymentRef != null && !paymentRef.isBlank()) {
            body.append("Transaction Ref:  ").append(paymentRef).append("\n");
        }
        body.append("Subtotal:         INR ").append(String.format("%.2f", order.getSubtotal())).append("\n");
        if (order.getDiscount() > 0) {
            body.append("Discount:        -INR ").append(String.format("%.2f", order.getDiscount()));
            if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
                body.append(" (Coupon: ").append(order.getCouponCode()).append(")");
            }
            body.append("\n");
        }
        body.append("Delivery Fee:     ").append(order.getDeliveryFee() == 0 ? "FREE" : "INR " + String.format("%.2f", order.getDeliveryFee())).append("\n");
        body.append("Tax (5% GST):     INR ").append(String.format("%.2f", order.getTax())).append("\n");
        body.append("--------------------------------------------------\n");
        body.append("TOTAL AMOUNT:     INR ").append(String.format("%.2f", order.getTotal())).append("\n");
        body.append("==================================================\n\n");
    }

    private void appendProductsList(StringBuilder body, Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }
        body.append("==================================================\n");
        body.append("PRODUCTS PURCHASED (").append(order.getItems().size()).append(" item").append(order.getItems().size() > 1 ? "s" : "").append(")\n");
        body.append("==================================================\n");
        int index = 1;
        for (OrderItem item : order.getItems()) {
            String unitStr = (item.getUnit() != null && !item.getUnit().isBlank()) ? " " + item.getUnit() : "";
            body.append(String.format("%2d. %-32s x %-2d %-6s INR %8.2f\n",
                    index++,
                    item.getName() != null ? item.getName() : "Grocery Item",
                    item.getQuantity(),
                    unitStr,
                    item.getTotal()));
        }
        body.append("\n");
    }

    private void appendDeliveryDetails(StringBuilder body, Order order) {
        if (order.getDeliveryAddress() != null) {
            body.append("DELIVERY ADDRESS:\n");
            body.append("Recipient:  ").append(order.getDeliveryAddress().getFullName()).append("\n");
            body.append("Phone:      ").append(order.getDeliveryAddress().getPhone()).append("\n");
            body.append("Address:    ").append(order.getDeliveryAddress().getStreet());
            if (order.getDeliveryAddress().getApartment() != null && !order.getDeliveryAddress().getApartment().isBlank()) {
                body.append(", ").append(order.getDeliveryAddress().getApartment());
            }
            body.append("\n            ")
                    .append(order.getDeliveryAddress().getCity()).append(", ")
                    .append(order.getDeliveryAddress().getState()).append(" - ")
                    .append(order.getDeliveryAddress().getPincode()).append("\n");
            if (order.getDeliveryAddress().getLandmark() != null && !order.getDeliveryAddress().getLandmark().isBlank()) {
                body.append("Landmark:   ").append(order.getDeliveryAddress().getLandmark()).append("\n");
            }
            body.append("\n");
        }

        if (order.getDeliverySlot() != null) {
            body.append("DELIVERY SCHEDULE:\n");
            if (order.getDeliverySlot().getDate() != null) {
                body.append("Date:       ").append(order.getDeliverySlot().getDate()).append("\n");
            }
            if (order.getDeliverySlot().getTitle() != null) {
                body.append("Slot:       ").append(order.getDeliverySlot().getTitle()).append("\n");
            }
            body.append("\n");
        }
    }

    private String formatPaymentMethod(String method) {
        if (method == null) return "Online Payment";
        switch (method.toUpperCase()) {
            case "ONLINE_RAZORPAY": return "Online (Razorpay / UPI / Cards / NetBanking)";
            case "CASH_ON_DELIVERY": return "Cash on Delivery (COD)";
            case "UPI": return "UPI (Google Pay / PhonePe / Paytm)";
            default: return method;
        }
    }
}
