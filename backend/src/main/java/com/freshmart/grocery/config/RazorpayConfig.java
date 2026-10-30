package com.freshmart.grocery.config;

import com.razorpay.RazorpayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    @Value("${app.razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.razorpay.currency:INR}")
    private String currency;

    @Value("${app.razorpay.mock-mode:${razorpay.mock-mode:false}}")
    private boolean mockMode;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            logger.info("Initializing RazorpayClient with Key ID: {}, Currency: {}", keyId, currency);
            return new RazorpayClient(keyId, keySecret);
        } catch (Exception ex) {
            logger.warn("Could not initialize RazorpayClient: {}", ex.getMessage());
            return null;
        }
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public String getCurrency() {
        return currency;
    }

    public boolean isMockMode() {
        return mockMode;
    }
}
