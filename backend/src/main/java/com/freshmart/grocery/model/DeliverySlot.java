package com.freshmart.grocery.model;

public class DeliverySlot {
    private String slotId; // e.g. "morning_07_10", "afternoon_12_15", "evening_17_20", "express_45m"
    private String title;  // "Early Morning (07:00 AM - 10:00 AM)"
    private String type;   // "STANDARD", "EXPRESS", "ECO"
    private double extraFee; // 0.0 or 25.0
    private String date;   // "YYYY-MM-DD"

    public DeliverySlot() {}

    public DeliverySlot(String slotId, String title, String type, double extraFee, String date) {
        this.slotId = slotId;
        this.title = title;
        this.type = type;
        this.extraFee = extraFee;
        this.date = date;
    }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getExtraFee() { return extraFee; }
    public void setExtraFee(double extraFee) { this.extraFee = extraFee; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
