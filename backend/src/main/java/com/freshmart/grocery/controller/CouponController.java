package com.freshmart.grocery.controller;

import com.freshmart.grocery.dto.CouponVerifyRequest;
import com.freshmart.grocery.dto.CouponVerifyResponse;
import com.freshmart.grocery.model.Coupon;
import com.freshmart.grocery.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons", description = "Discount coupons and promotion engine")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of all active promotional discount coupons")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify coupon code and compute discount amount on current cart subtotal")
    public ResponseEntity<CouponVerifyResponse> verifyCoupon(@RequestBody CouponVerifyRequest request) {
        return ResponseEntity.ok(couponService.verifyCoupon(request));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin: Create or update a coupon")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.saveCoupon(coupon));
    }
}
