package com.freshmart.grocery.dto;

public class RazorpayOrderResponse {
    private String id;
    private String entity;
    private double amount;
    private double amountPaid;
    private double amountDue;
    private String currency;
    private String receipt;
    private String status;
    private String keyId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private boolean isMock;

    public RazorpayOrderResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEntity() { return entity; }
    public void setEntity(String entity) { this.entity = entity; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(double amountPaid) { this.amountPaid = amountPaid; }

    public double getAmountDue() { return amountDue; }
    public void setAmountDue(double amountDue) { this.amountDue = amountDue; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public boolean isMock() { return isMock; }
    public void setMock(boolean mock) { isMock = mock; }
}
