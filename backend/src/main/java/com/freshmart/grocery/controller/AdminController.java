package com.freshmart.grocery.controller;

import com.freshmart.grocery.dto.DashboardStatsResponse;
import com.freshmart.grocery.model.Order;
import com.freshmart.grocery.model.Product;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.ProductRepository;
import com.freshmart.grocery.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin", description = "Store analytics, metrics, inventory control and fulfillment dashboard")
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get overall store performance metrics, revenue, and inventory alerts")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        double revenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .mapToDouble(Order::getTotal)
                .sum();

        long lowStockCount = allProducts.stream()
                .filter(p -> p.getStockQuantity() <= 10)
                .count();

        Map<String, Long> statusCounts = new HashMap<>();
        for (Order o : allOrders) {
            statusCounts.put(o.getStatus(), statusCounts.getOrDefault(o.getStatus(), 0L) + 1);
        }

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalRevenue(Math.round(revenue * 100.0) / 100.0);
        stats.setTotalOrders(allOrders.size());
        stats.setTotalProducts(allProducts.size());
        stats.setLowStockProducts(lowStockCount);
        stats.setTotalCustomers(userRepository.count());
        stats.setOrdersByStatus(statusCounts);

        return ResponseEntity.ok(stats);
    }
}
