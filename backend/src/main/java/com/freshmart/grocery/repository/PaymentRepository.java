package com.freshmart.grocery.repository;

import com.freshmart.grocery.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Payment> findByStatusOrderByCreatedAtDesc(String status);

    List<Payment> findByPaymentCategoryOrderByCreatedAtDesc(String paymentCategory);

    List<Payment> findByStatusAndPaymentCategoryOrderByCreatedAtDesc(String status, String paymentCategory);

    List<Payment> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
