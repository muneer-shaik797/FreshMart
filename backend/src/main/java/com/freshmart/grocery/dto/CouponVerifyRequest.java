package com.freshmart.grocery.dto;

public class CouponVerifyRequest {
    private String code;
    private double cartTotal;

    public CouponVerifyRequest() {}

    public CouponVerifyRequest(String code, double cartTotal) {
        this.code = code;
        this.cartTotal = cartTotal;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public double getCartTotal() { return cartTotal; }
    public void setCartTotal(double cartTotal) { this.cartTotal = cartTotal; }
}
