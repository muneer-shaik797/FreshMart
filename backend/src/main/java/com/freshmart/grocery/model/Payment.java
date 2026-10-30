package com.freshmart.grocery.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @Indexed
    private String orderId;

    @Indexed
    private String orderNumber;

    @Indexed
    private String userId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private double amount;
    private String currency = "INR";

    @Indexed
    private String paymentCategory = "UPI"; // UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, RAZORPAY_WALLET, CASH_ON_DELIVERY

    private String paymentMethod = "ONLINE_RAZORPAY"; // ONLINE_RAZORPAY, CASH_ON_DELIVERY

    @Indexed
    private String status = "PENDING"; // SUCCESS, FAILED, PENDING, REFUNDED

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String failureReason;
    private String transactionReference;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Payment() {}

    public Payment(String orderId, String orderNumber, String userId, String customerName, 
                   String customerEmail, String customerPhone, double amount, String currency, 
                   String paymentCategory, String paymentMethod, String status) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.amount = amount;
        this.currency = currency;
        this.paymentCategory = paymentCategory;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentCategory() { return paymentCategory; }
    public void setPaymentCategory(String paymentCategory) { this.paymentCategory = paymentCategory; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
