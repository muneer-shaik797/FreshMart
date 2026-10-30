package com.freshmart.grocery.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
public class Product {
    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    @Indexed
    private String category; // "Fresh Produce", "Dairy & Eggs", "Bakery & Bread", "Beverages", "Pantry & Staples", "Snacks & Confectionery", "Meat & Seafood", "Organic & Health"

    private double price;
    private double originalPrice;
    private int discountPercent;

    private String unit; // "1 kg", "500 g", "1 L", "Pack of 6", "250 g"

    private int stockQuantity;
    private boolean inStock;

    private String imageUrl;

    private double rating = 4.8;
    private int reviewCount = 24;

    private List<String> tags = new ArrayList<>(); // "Organic", "Gluten-Free", "Farm Fresh", "Vegan", "Best Seller"

    private boolean isOrganic;
    private boolean isFeatured;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Product() {}

    public Product(String name, String description, String category, double price, double originalPrice,
                   String unit, int stockQuantity, String imageUrl, List<String> tags, boolean isOrganic, boolean isFeatured) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.originalPrice = originalPrice;
        this.discountPercent = originalPrice > price ? (int) Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
        this.unit = unit;
        this.stockQuantity = stockQuantity;
        this.inStock = stockQuantity > 0;
        this.imageUrl = imageUrl;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.isOrganic = isOrganic;
        this.isFeatured = isFeatured;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) {
        this.price = price;
        recalculateDiscount();
    }

    public double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(double originalPrice) {
        this.originalPrice = originalPrice;
        recalculateDiscount();
    }

    public int getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(int discountPercent) { this.discountPercent = discountPercent; }

    private void recalculateDiscount() {
        if (originalPrice > price && originalPrice > 0) {
            this.discountPercent = (int) Math.round(((originalPrice - price) / originalPrice) * 100);
        } else {
            this.discountPercent = 0;
        }
    }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
        this.inStock = stockQuantity > 0;
    }

    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public boolean isOrganic() { return isOrganic; }
    public void setOrganic(boolean organic) { isOrganic = organic; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
