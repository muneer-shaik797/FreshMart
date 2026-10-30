package com.freshmart.grocery.repository;

import com.freshmart.grocery.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryIgnoreCase(String category);

    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } }, { 'tags': { $regex: ?0, $options: 'i' } } ] }")
    List<Product> searchProducts(String keyword);

    List<Product> findByIsFeaturedTrue();

    List<Product> findByIsOrganicTrue();

    List<Product> findByInStockTrue();

    List<Product> findTop8ByCategoryOrderByRatingDesc(String category);

    List<Product> findTop6ByOrderByRatingDesc();
}
