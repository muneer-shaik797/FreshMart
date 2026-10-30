package com.freshmart.grocery.service;

import com.freshmart.grocery.model.Product;
import com.freshmart.grocery.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;

    public RecommendationService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Recommends products frequently bought together with the given category/product
     */
    public List<Product> getFrequentlyBoughtTogether(String productId, String category) {
        List<Product> products = productRepository.findByCategoryIgnoreCase(category);
        return products.stream()
                .filter(p -> !p.getId().equals(productId) && p.isInStock())
                .limit(4)
                .collect(Collectors.toList());
    }

    /**
     * Personalized recommendations based on user cart categories or browsing
     */
    public List<Product> getPersonalizedRecommendations(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return productRepository.findTop8ByCategoryOrderByRatingDesc("Fresh Produce");
        }

        List<Product> results = new ArrayList<>();
        for (String cat : categories) {
            results.addAll(productRepository.findTop8ByCategoryOrderByRatingDesc(cat));
        }

        if (results.isEmpty()) {
            return productRepository.findTop6ByOrderByRatingDesc();
        }

        Collections.shuffle(results);
        return results.stream().distinct().limit(6).collect(Collectors.toList());
    }

    /**
     * Top trending/deals
     */
    public List<Product> getTrendingDeals() {
        return productRepository.findAll().stream()
                .filter(p -> p.getDiscountPercent() >= 15 && p.isInStock())
                .sorted((a, b) -> Integer.compare(b.getDiscountPercent(), a.getDiscountPercent()))
                .limit(6)
                .collect(Collectors.toList());
    }
}
