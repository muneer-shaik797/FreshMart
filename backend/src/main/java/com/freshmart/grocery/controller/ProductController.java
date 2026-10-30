package com.freshmart.grocery.controller;

import com.freshmart.grocery.model.Product;
import com.freshmart.grocery.service.ProductService;
import com.freshmart.grocery.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product catalog, filtering, search, recommendations and inventory management")
public class ProductController {

    private final ProductService productService;
    private final RecommendationService recommendationService;

    public ProductController(ProductService productService, RecommendationService recommendationService) {
        this.productService = productService;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    @Operation(summary = "Get products with optional category, search, organic, inStock, and sorting filters")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean organic,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) String sortBy
    ) {
        return ResponseEntity.ok(productService.filterProducts(category, search, organic, inStockOnly, sortBy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get list of all supported grocery categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(Arrays.asList(
                "Fresh Produce",
                "Dairy & Eggs",
                "Bakery & Bread",
                "Beverages",
                "Pantry & Staples",
                "Snacks & Confectionery",
                "Meat & Seafood",
                "Organic & Health"
        ));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products for homepage spotlight")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized recommendations based on cart categories or trending deals")
    public ResponseEntity<List<Product>> getRecommendations(
            @RequestParam(required = false) List<String> categories
    ) {
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(categories));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get top trending discounted deals")
    public ResponseEntity<List<Product>> getTrendingDeals() {
        return ResponseEntity.ok(recommendationService.getTrendingDeals());
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get frequently bought together items for a product")
    public ResponseEntity<List<Product>> getRelatedProducts(@PathVariable String id, @RequestParam String category) {
        return ResponseEntity.ok(recommendationService.getFrequentlyBoughtTogether(id, category));
    }

    // Admin endpoints
    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Add a new grocery product")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Update an existing product")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        product.setId(id);
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PatchMapping("/admin/{id}/stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Quick update of product stock quantity")
    public ResponseEntity<Product> updateStock(@PathVariable String id, @RequestBody Map<String, Integer> payload) {
        int stock = payload.getOrDefault("stockQuantity", 0);
        return ResponseEntity.ok(productService.updateStock(id, stock));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Remove a product from the catalog")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
