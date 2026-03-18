package com.food.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MenuItemRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    private Boolean availability = true;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;
}
