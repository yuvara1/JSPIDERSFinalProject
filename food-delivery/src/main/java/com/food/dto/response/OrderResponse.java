package com.food.dto.response;

import com.food.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private LocalDateTime orderDateTime;
    private OrderStatus status;
    private Double totalAmount;
    private Long customerId;
    private String customerName;
    private Long restaurantId;
    private String restaurantName;
    private PaymentResponse payment;
    private List<OrderItemResponse> orderItems;
}
