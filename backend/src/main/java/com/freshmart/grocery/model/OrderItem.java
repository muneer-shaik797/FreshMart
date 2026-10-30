package com.freshmart.grocery.model;

public class OrderItem {
    private String productId;
    private String name;
    private String imageUrl;
    private String unit;
    private double price;
    private int quantity;
    private double total;

    public OrderItem() {}

    public OrderItem(String productId, String name, String imageUrl, String unit, double price, int quantity) {
        this.productId = productId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.unit = unit;
        this.price = price;
        this.quantity = quantity;
        this.total = price * quantity;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getPrice() { return price; }
    public void setPrice(double price) {
        this.price = price;
        this.total = this.price * this.quantity;
    }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.total = this.price * this.quantity;
    }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}
