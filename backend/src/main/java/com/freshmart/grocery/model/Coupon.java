package com.freshmart.grocery.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "coupons")
public class Coupon {
    @Id
    private String id;

    @Indexed(unique = true)
    private String code; // e.g. "FRESH20", "SUPERGROCERY", "FIRST50"

    private String description;
    private double discountPercent; // e.g. 20.0
    private double flatDiscount;    // e.g. 50.0 (if percent is 0)
    private double maxDiscount;     // e.g. 150.0
    private double minOrderValue;   // e.g. 399.0
    private boolean active = true;
    private Instant validUntil;

    public Coupon() {}

    public Coupon(String code, String description, double discountPercent, double flatDiscount, double maxDiscount, double minOrderValue, Instant validUntil) {
        this.code = code;
        this.description = description;
        this.discountPercent = discountPercent;
        this.flatDiscount = flatDiscount;
        this.maxDiscount = maxDiscount;
        this.minOrderValue = minOrderValue;
        this.active = true;
        this.validUntil = validUntil;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public double getFlatDiscount() { return flatDiscount; }
    public void setFlatDiscount(double flatDiscount) { this.flatDiscount = flatDiscount; }

    public double getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(double maxDiscount) { this.maxDiscount = maxDiscount; }

    public double getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(double minOrderValue) { this.minOrderValue = minOrderValue; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getValidUntil() { return validUntil; }
    public void setValidUntil(Instant validUntil) { this.validUntil = validUntil; }
}
