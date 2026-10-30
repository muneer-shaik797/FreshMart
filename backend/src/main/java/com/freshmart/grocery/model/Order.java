package com.freshmart.grocery.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber;

    @Indexed
    private String userId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private List<OrderItem> items = new ArrayList<>();

    private Address deliveryAddress;
    private DeliverySlot deliverySlot;
    private String deliveryNotes;

    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED
    private String paymentMethod = "ONLINE_RAZORPAY"; // ONLINE_RAZORPAY, CASH_ON_DELIVERY
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private double subtotal;
    private double discount;
    private String couponCode;
    private double deliveryFee;
    private double tax;
    private double total;

    @Indexed
    private String status = "PLACED"; // PLACED, CONFIRMED, PACKING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    private List<OrderStatusLog> timeline = new ArrayList<>();

    // Real-time Delivery Simulation details
    private String deliveryPartnerName = "Rajesh Kumar";
    private String deliveryPartnerPhone = "+91 98765 43210";
    private double driverLat = 12.9716;
    private double driverLng = 77.5946;
    private int estimatedMinutesRemaining = 35;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Address getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(Address deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public DeliverySlot getDeliverySlot() { return deliverySlot; }
    public void setDeliverySlot(DeliverySlot deliverySlot) { this.deliverySlot = deliverySlot; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(double deliveryFee) { this.deliveryFee = deliveryFee; }

    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<OrderStatusLog> getTimeline() { return timeline; }
    public void setTimeline(List<OrderStatusLog> timeline) { this.timeline = timeline; }

    public String getDeliveryPartnerName() { return deliveryPartnerName; }
    public void setDeliveryPartnerName(String deliveryPartnerName) { this.deliveryPartnerName = deliveryPartnerName; }

    public String getDeliveryPartnerPhone() { return deliveryPartnerPhone; }
    public void setDeliveryPartnerPhone(String deliveryPartnerPhone) { this.deliveryPartnerPhone = deliveryPartnerPhone; }

    public double getDriverLat() { return driverLat; }
    public void setDriverLat(double driverLat) { this.driverLat = driverLat; }

    public double getDriverLng() { return driverLng; }
    public void setDriverLng(double driverLng) { this.driverLng = driverLng; }

    public int getEstimatedMinutesRemaining() { return estimatedMinutesRemaining; }
    public void setEstimatedMinutesRemaining(int estimatedMinutesRemaining) { this.estimatedMinutesRemaining = estimatedMinutesRemaining; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
