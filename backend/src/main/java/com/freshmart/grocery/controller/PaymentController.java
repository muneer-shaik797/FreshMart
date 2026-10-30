package com.freshmart.grocery.controller;

import com.freshmart.grocery.dto.PaymentFailureRequest;
import com.freshmart.grocery.dto.PaymentVerifyRequest;
import com.freshmart.grocery.dto.RazorpayOrderResponse;
import com.freshmart.grocery.model.Payment;
import com.freshmart.grocery.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Razorpay payment processing, categories, and database transaction tracking")
public class PaymentController {

    private final PaymentService paymentService;
    private final com.freshmart.grocery.service.PaymentEmailService paymentEmailService;
    private final com.freshmart.grocery.repository.OrderRepository orderRepository;

    public PaymentController(PaymentService paymentService,
                             com.freshmart.grocery.service.PaymentEmailService paymentEmailService,
                             com.freshmart.grocery.repository.OrderRepository orderRepository) {
        this.paymentService = paymentService;
        this.paymentEmailService = paymentEmailService;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/resend-email/{orderId}")
    @Operation(summary = "Resend order & payment confirmation email to customer or specified email")
    public ResponseEntity<?> resendEmail(@PathVariable String orderId, @RequestParam(required = false) String email) {
        com.freshmart.grocery.model.Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        String target = (email != null && !email.isBlank()) ? email : order.getCustomerEmail();
        boolean sent = paymentEmailService.resendOrderConfirmation(order, target);
        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Order confirmation email sent to " + target + " for order " + order.getOrderNumber()
            ));
        } else {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "FAILED",
                    "message", "Failed to send email to " + target + ". Check server logs."
            ));
        }
    }

    @PostMapping("/test-email")
    @Operation(summary = "Send a test payment notification email to verify SMTP configuration")
    public ResponseEntity<?> sendTestEmail(@RequestParam(required = false) String to) {
        String recipient = (to != null && !to.isBlank()) ? to : "smuneer3779@gmail.com";
        boolean sent = paymentEmailService.sendTestEmail(recipient);
        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Test email successfully delivered to " + recipient
            ));
        } else {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "FAILED",
                    "message", "Failed to send test email to " + recipient + ". Check SMTP credentials in application.yml or server logs."
            ));
        }
    }

    @PostMapping("/create-order/{orderId}")
    @Operation(summary = "Create Razorpay payment order and initialize PENDING transaction in database")
    public ResponseEntity<RazorpayOrderResponse> createPaymentOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature and record SUCCESS/FAILED transaction in database")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        boolean verified = paymentService.verifyPayment(request);
        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Payment verified and recorded as SUCCESS in database!"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FAILED",
                    "message", "Payment verification failed and recorded as FAILED in database."
            ));
        }
    }

    @PostMapping("/fail")
    @Operation(summary = "Explicitly record a FAILED payment transaction in database with category and reason")
    public ResponseEntity<Payment> recordPaymentFailure(@RequestBody PaymentFailureRequest request) {
        return ResponseEntity.ok(paymentService.recordPaymentFailure(request));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get list of supported payment categories")
    public ResponseEntity<List<String>> getPaymentCategories() {
        return ResponseEntity.ok(Arrays.asList(
                "UPI",
                "CREDIT_CARD",
                "DEBIT_CARD",
                "NET_BANKING",
                "RAZORPAY_WALLET",
                "CASH_ON_DELIVERY"
        ));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: List all payment transactions from database with optional status (SUCCESS, FAILED) and category filters")
    public ResponseEntity<List<Payment>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(paymentService.getAllPayments(status, category));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment transaction details for a specific order")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) {
        return paymentService.getPaymentByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/me")
    @Operation(summary = "Get payment transactions of the currently authenticated customer")
    public ResponseEntity<List<Payment>> getUserPayments(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }
}
