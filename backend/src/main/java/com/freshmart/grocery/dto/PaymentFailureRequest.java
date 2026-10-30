package com.freshmart.grocery.dto;

public class PaymentFailureRequest {
    private String orderId;
    private String razorpayOrderId;
    private String reason;
    private String paymentCategory; // UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, RAZORPAY_WALLET, CASH_ON_DELIVERY

    public PaymentFailureRequest() {}

    public PaymentFailureRequest(String orderId, String razorpayOrderId, String reason, String paymentCategory) {
        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.reason = reason;
        this.paymentCategory = paymentCategory;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getPaymentCategory() { return paymentCategory; }
    public void setPaymentCategory(String paymentCategory) { this.paymentCategory = paymentCategory; }
}
