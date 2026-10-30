package com.freshmart.grocery.websocket;

import com.freshmart.grocery.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketOrderService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketOrderService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketOrderService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastOrderUpdate(Order order, String eventType) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", eventType); // ORDER_CREATED, STATUS_UPDATED, DRIVER_MOVED, CANCELLED
            payload.put("orderId", order.getId());
            payload.put("orderNumber", order.getOrderNumber());
            payload.put("status", order.getStatus());
            payload.put("timeline", order.getTimeline());
            payload.put("driverLat", order.getDriverLat());
            payload.put("driverLng", order.getDriverLng());
            payload.put("estimatedMinutesRemaining", order.getEstimatedMinutesRemaining());
            payload.put("updatedAt", order.getUpdatedAt());
            payload.put("order", order);

            // Notify specific order subscriber
            messagingTemplate.convertAndSend("/topic/orders/" + order.getId(), payload);

            // Notify user-level channel
            if (order.getUserId() != null) {
                messagingTemplate.convertAndSend("/topic/orders/user/" + order.getUserId(), payload);
            }

            // Notify admin dashboard
            messagingTemplate.convertAndSend("/topic/admin/orders", payload);

            logger.info("Broadcasted WebSocket order update: orderId={}, status={}, event={}",
                    order.getId(), order.getStatus(), eventType);
        } catch (Exception ex) {
            logger.error("Failed to send WebSocket message for order {}: {}", order.getId(), ex.getMessage());
        }
    }
}
