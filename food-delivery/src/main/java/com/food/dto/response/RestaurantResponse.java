package com.food.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestaurantResponse {
    private Long restaurantId;
    private String restaurantName;
    private String location;
}
