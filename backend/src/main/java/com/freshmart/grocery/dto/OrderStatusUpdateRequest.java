package com.freshmart.grocery.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status; // PLACED, CONFIRMED, PACKING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    private String description;
    private Double driverLat;
    private Double driverLng;
    private Integer estimatedMinutesRemaining;

    public OrderStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getDriverLat() { return driverLat; }
    public void setDriverLat(Double driverLat) { this.driverLat = driverLat; }

    public Double getDriverLng() { return driverLng; }
    public void setDriverLng(Double driverLng) { this.driverLng = driverLng; }

    public Integer getEstimatedMinutesRemaining() { return estimatedMinutesRemaining; }
    public void setEstimatedMinutesRemaining(Integer estimatedMinutesRemaining) { this.estimatedMinutesRemaining = estimatedMinutesRemaining; }
}
