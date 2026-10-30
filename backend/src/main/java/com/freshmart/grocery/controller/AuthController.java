package com.freshmart.grocery.controller;

import com.freshmart.grocery.dto.AuthRequest;
import com.freshmart.grocery.dto.AuthResponse;
import com.freshmart.grocery.dto.RegisterRequest;
import com.freshmart.grocery.model.Address;
import com.freshmart.grocery.model.User;
import com.freshmart.grocery.service.CacheAndRateLimiterService;
import com.freshmart.grocery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for Customer & Admin registration, login, profile")
public class AuthController {

    private final UserService userService;
    private final CacheAndRateLimiterService rateLimiterService;

    public AuthController(UserService userService, CacheAndRateLimiterService rateLimiterService) {
        this.userService = userService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user (Customer or Admin)")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        if (!rateLimiterService.allowRequest("reg_" + clientIp, 10, 60)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Rate limit exceeded. Please wait a minute."));
        }
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login with email & password to retrieve JWT")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        if (!rateLimiterService.allowRequest("login_" + clientIp, 20, 60)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many login attempts. Please wait a minute."));
        }
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        String userId = authentication.getName();
        return userService.findById(userId)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "addresses", user.getAddresses()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/addresses")
    @Operation(summary = "Add delivery address to current user profile")
    public ResponseEntity<?> addAddress(@RequestBody Address address, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = authentication.getName();
        User updated = userService.addAddress(userId, address);
        return ResponseEntity.ok(updated.getAddresses());
    }

    @GetMapping("/addresses")
    @Operation(summary = "Get saved addresses of current user")
    public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(userService.getAddresses(userId));
    }
}
