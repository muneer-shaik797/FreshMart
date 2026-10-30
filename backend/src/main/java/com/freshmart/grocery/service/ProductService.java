package com.freshmart.grocery.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freshmart.grocery.model.Product;
import com.freshmart.grocery.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CacheAndRateLimiterService cacheService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductService(ProductRepository productRepository, CacheAndRateLimiterService cacheService) {
        this.productRepository = productRepository;
        this.cacheService = cacheService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> filterProducts(String category, String search, Boolean organic, Boolean inStockOnly, String sortBy) {
        List<Product> list;

        if (search != null && !search.trim().isEmpty()) {
            list = productRepository.searchProducts(search.trim());
        } else if (category != null && !category.equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            list = productRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            list = productRepository.findAll();
        }

        if (organic != null && organic) {
            list = list.stream().filter(Product::isOrganic).collect(Collectors.toList());
        }

        if (inStockOnly != null && inStockOnly) {
            list = list.stream().filter(Product::isInStock).collect(Collectors.toList());
        }

        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                    list.sort(Comparator.comparingDouble(Product::getPrice));
                    break;
                case "price_desc":
                    list.sort(Comparator.comparingDouble(Product::getPrice).reversed());
                    break;
                case "rating":
                    list.sort(Comparator.comparingDouble(Product::getRating).reversed());
                    break;
                case "discount":
                    list.sort(Comparator.comparingInt(Product::getDiscountPercent).reversed());
                    break;
                default:
                    break;
            }
        }

        return list;
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    public Product saveProduct(Product product) {
        product.setUpdatedAt(Instant.now());
        product.setInStock(product.getStockQuantity() > 0);
        Product saved = productRepository.save(product);
        cacheService.evictCache("featured_products");
        return saved;
    }

    public Product updateStock(String productId, int newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        product.setStockQuantity(newStock);
        product.setInStock(newStock > 0);
        product.setUpdatedAt(Instant.now());
        return productRepository.save(product);
    }

    public void deductStock(String productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock for: " + product.getName() + " (Requested: " + quantity + ", Available: " + product.getStockQuantity() + ")");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.setInStock(product.getStockQuantity() > 0);
        product.setUpdatedAt(Instant.now());
        productRepository.save(product);
    }

    public void restoreStock(String productId, int quantity) {
        productRepository.findById(productId).ifPresent(p -> {
            p.setStockQuantity(p.getStockQuantity() + quantity);
            p.setInStock(p.getStockQuantity() > 0);
            p.setUpdatedAt(Instant.now());
            productRepository.save(p);
        });
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
        cacheService.evictCache("featured_products");
    }
}
