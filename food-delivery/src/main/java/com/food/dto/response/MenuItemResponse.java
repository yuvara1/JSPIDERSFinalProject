package com.food.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemResponse {
    private Long itemId;
    private String itemName;
    private Double price;
    private Boolean availability;
    private Long restaurantId;
    private String restaurantName;
}
