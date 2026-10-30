package com.freshmart.grocery.dto;

public class CouponVerifyResponse {
    private boolean valid;
    private String message;
    private String code;
    private double discountAmount;
    private double finalTotal;

    public CouponVerifyResponse() {}

    public CouponVerifyResponse(boolean valid, String message, String code, double discountAmount, double finalTotal) {
        this.valid = valid;
        this.message = message;
        this.code = code;
        this.discountAmount = discountAmount;
        this.finalTotal = finalTotal;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public double getFinalTotal() { return finalTotal; }
    public void setFinalTotal(double finalTotal) { this.finalTotal = finalTotal; }
}
