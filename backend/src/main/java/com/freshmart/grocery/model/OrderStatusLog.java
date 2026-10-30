package com.freshmart.grocery.model;

import java.time.Instant;

public class OrderStatusLog {
    private String status; // PLACED, CONFIRMED, PACKING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    private String description;
    private Instant timestamp;
    private String updatedBy;

    public OrderStatusLog() {
        this.timestamp = Instant.now();
    }

    public OrderStatusLog(String status, String description, String updatedBy) {
        this.status = status;
        this.description = description;
        this.updatedBy = updatedBy;
        this.timestamp = Instant.now();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
