package com.freshmart.grocery.dto;

import com.freshmart.grocery.model.Address;
import com.freshmart.grocery.model.DeliverySlot;
import com.freshmart.grocery.model.OrderItem;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderRequest {
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItem> items;

    @NotNull(message = "Delivery address is required")
    private Address deliveryAddress;

    @NotNull(message = "Delivery slot is required")
    private DeliverySlot deliverySlot;

    private String deliveryNotes;
    private String paymentMethod; // "ONLINE_RAZORPAY", "CASH_ON_DELIVERY"
    private String couponCode;
    private String customerEmail;

    public OrderRequest() {}

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Address getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(Address deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public DeliverySlot getDeliverySlot() { return deliverySlot; }
    public void setDeliverySlot(DeliverySlot deliverySlot) { this.deliverySlot = deliverySlot; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
