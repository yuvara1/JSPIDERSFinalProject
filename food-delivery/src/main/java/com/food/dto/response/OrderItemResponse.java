package com.food.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long orderItemId;
    private Long itemId;
    private String itemName;
    private Integer quantity;
    private Double subtotal;
}
