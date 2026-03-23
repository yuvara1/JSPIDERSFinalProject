package com.food.controller;

import com.food.dto.request.RestaurantRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.MenuItemResponse;
import com.food.dto.response.RestaurantResponse;
import com.food.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "Restaurant management endpoints")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    @Operation(summary = "Create restaurant", description = "Add a new restaurant")
    public ResponseEntity<ApiResponse<RestaurantResponse>> addRestaurant(@Valid @RequestBody RestaurantRequest request) {
        log.info("Adding restaurant: {}", request.getRestaurantName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(restaurantService.addRestaurant(request), "Restaurant created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all restaurants", description = "Fetch all restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getAllRestaurants() {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getAllRestaurants(), "Restaurants retrieved successfully"));
    }

    // Specific paths must come BEFORE generic /{id} path to avoid conflicts

    @GetMapping("/paginated")
    @Operation(summary = "Get restaurants paginated", description = "Fetch restaurants with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<RestaurantResponse>>> getRestaurantsPaginated(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "restaurantName") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.getRestaurantsWithPaginationAndSorting(page, size, sortBy, direction),
                "Paginated restaurants retrieved successfully"
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantResponse>> searchRestaurantsByName(@RequestParam String restaurantName) {
        log.info("Searching restaurants by name: {}", restaurantName);
        List<RestaurantResponse> results = restaurantService.searchByName(restaurantName);
        return ResponseEntity.ok(results);
    }


    @GetMapping("/location")
    @Operation(summary = "Filter restaurants by location", description = "Get all restaurants in a specific location")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getRestaurantsByLocation(@RequestParam String location) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getRestaurantsByLocation(location), "Restaurants retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant by ID", description = "Fetch restaurant details using restaurant ID")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getRestaurantById(id), "Restaurant retrieved successfully"));
    }

    @GetMapping("/{id}/menu")
    @Operation(summary = "Get restaurant menu", description = "Fetch all menu items for a restaurant")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItemsByRestaurant(@PathVariable Long id) {
        List<MenuItemResponse> menuItems = restaurantService.getMenuItemsByRestaurant(id);
        String message = menuItems.isEmpty() ? "No menu items found for this restaurant" : "Menu items retrieved successfully";
        return ResponseEntity.ok(ApiResponse.success(menuItems, message));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update restaurant", description = "Update restaurant details")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request) {
        log.info("Updating restaurant with id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(restaurantService.updateRestaurant(id, request), "Restaurant updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete restaurant", description = "Remove a restaurant from the system")
    public ResponseEntity<ApiResponse<Void>> deleteRestaurant(@PathVariable Long id) {
        log.info("Deleting restaurant with id: {}", id);
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok(ApiResponse.success("Restaurant deleted successfully"));
    }
}
