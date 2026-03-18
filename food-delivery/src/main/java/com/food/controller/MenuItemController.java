package com.food.controller;

import com.food.dto.request.MenuItemRequest;
import com.food.dto.request.UpdatePriceRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.MenuItemResponse;
import com.food.service.MenuItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Items", description = "Menu item management endpoints")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PostMapping
    @Operation(summary = "Add menu item", description = "Create a new menu item for a restaurant")
    public ResponseEntity<ApiResponse<MenuItemResponse>> addMenuItem(@Valid @RequestBody MenuItemRequest request) {
        log.info("Adding menu item: {}", request.getItemName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuItemService.addMenuItem(request), "Menu item created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all menu items", description = "Fetch all menu items")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllMenuItems() {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getAllMenuItems(), "Menu items retrieved successfully"));
    }



    @GetMapping("/price")
    @Operation(summary = "Filter by price", description = "Get menu items with price greater than specified value")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getItemsByPriceGreaterThan(@RequestParam Double price) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getItemsWithPriceGreaterThan(price), "Menu items retrieved successfully"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search menu items by name", description = "Find menu items by name using query parameter")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getItemsByName(name), "Menu items retrieved successfully"));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get menu items by name (path parameter)", description = "Find menu items by name using path parameter")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getItemsByName(@PathVariable String name) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getItemsByName(name), "Menu items retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get menu item by ID", description = "Fetch menu item details using item ID")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getMenuItemById(id), "Menu item retrieved successfully"));
    }

    @PatchMapping("/{id}/price")
    @Operation(summary = "Update price", description = "Update menu item price")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriceRequest request) {
        log.info("Updating price for menu item id: {} to: {}", id, request.getPrice());
        return ResponseEntity.ok(ApiResponse.success(menuItemService.updatePrice(id, request), "Menu item price updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete menu item", description = "Remove a menu item")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        log.info("Deleting menu item with id: {}", id);
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully"));
    }
}
