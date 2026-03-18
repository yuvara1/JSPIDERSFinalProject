package com.food.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank(message = "Location is required")
    private String location;
}
