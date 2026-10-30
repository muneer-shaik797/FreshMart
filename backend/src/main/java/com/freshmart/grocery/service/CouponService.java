package com.freshmart.grocery.service;

import com.freshmart.grocery.dto.CouponVerifyRequest;
import com.freshmart.grocery.dto.CouponVerifyResponse;
import com.freshmart.grocery.model.Coupon;
import com.freshmart.grocery.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findByActiveTrue();
    }

    public Optional<Coupon> findByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code.trim());
    }

    public CouponVerifyResponse verifyCoupon(CouponVerifyRequest req) {
        if (req.getCode() == null || req.getCode().trim().isEmpty()) {
            return new CouponVerifyResponse(false, "Coupon code cannot be empty", null, 0.0, req.getCartTotal());
        }

        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(req.getCode().trim());
        if (opt.isEmpty()) {
            return new CouponVerifyResponse(false, "Invalid coupon code", req.getCode(), 0.0, req.getCartTotal());
        }

        Coupon coupon = opt.get();

        if (!coupon.isActive()) {
            return new CouponVerifyResponse(false, "This coupon has expired or is inactive", coupon.getCode(), 0.0, req.getCartTotal());
        }

        if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(Instant.now())) {
            return new CouponVerifyResponse(false, "This coupon has expired", coupon.getCode(), 0.0, req.getCartTotal());
        }

        if (req.getCartTotal() < coupon.getMinOrderValue()) {
            return new CouponVerifyResponse(false,
                    String.format("Minimum cart order value of ₹%.0f required for this coupon", coupon.getMinOrderValue()),
                    coupon.getCode(), 0.0, req.getCartTotal());
        }

        double discount = 0.0;
        if (coupon.getDiscountPercent() > 0) {
            discount = (coupon.getDiscountPercent() / 100.0) * req.getCartTotal();
            if (coupon.getMaxDiscount() > 0 && discount > coupon.getMaxDiscount()) {
                discount = coupon.getMaxDiscount();
            }
        } else if (coupon.getFlatDiscount() > 0) {
            discount = coupon.getFlatDiscount();
        }

        discount = Math.min(discount, req.getCartTotal());
        double finalTotal = Math.max(0.0, req.getCartTotal() - discount);

        return new CouponVerifyResponse(true,
                String.format("Coupon %s applied! Saved ₹%.2f", coupon.getCode(), discount),
                coupon.getCode(),
                Math.round(discount * 100.0) / 100.0,
                Math.round(finalTotal * 100.0) / 100.0);
    }

    public Coupon saveCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }
}
