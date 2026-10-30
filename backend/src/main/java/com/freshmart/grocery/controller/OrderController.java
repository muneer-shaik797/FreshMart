package com.freshmart.grocery.controller;

import com.freshmart.grocery.dto.OrderRequest;
import com.freshmart.grocery.dto.OrderStatusUpdateRequest;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order placement, live tracking, status timeline, and driver simulation")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Place a new grocery order with scheduled delivery slot and address")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required to place order"));
        }
        String userId = authentication.getName();
        try {
            Order order = orderService.createOrder(userId, request);
            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details and live tracking state by ID")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order details and live tracking state by order number")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/me")
    @Operation(summary = "Get all orders for current authenticated user")
    public ResponseEntity<List<Order>> getCurrentUserOrders(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order and restock items")
    public ResponseEntity<?> cancelOrder(@PathVariable String id,
                                         @RequestBody(required = false) Map<String, String> body,
                                         Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        String reason = body != null ? body.get("reason") : "Customer requested cancellation";
        try {
            Order cancelled = orderService.cancelOrder(id, userId, reason);
            return ResponseEntity.ok(cancelled);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/simulate-driver")
    @Operation(summary = "Simulate live delivery driver movement and ETA progress for demonstration")
    public ResponseEntity<Order> simulateDriver(@PathVariable String id) {
        return ResponseEntity.ok(orderService.simulateDriverMovement(id));
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Get all orders across the store")
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Update order status (triggers real-time WebSocket push to customer)")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody OrderStatusUpdateRequest request,
            Authentication authentication
    ) {
        String updatedBy = authentication != null ? authentication.getName() : "Admin";
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request, updatedBy));
    }
}
