package com.food.controller;

import com.food.dto.request.OrderRequest;
import com.food.dto.request.UpdateOrderStatusRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.OrderResponse;
import com.food.entity.Order;
import com.food.enums.OrderStatus;
import com.food.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place order", description = "Create a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@Valid @RequestBody OrderRequest request) {
        log.info("Placing order for customer id: {}, restaurant id: {}", request.getCustomerId(), request.getRestaurantId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderService.placeOrder(request), "Order placed successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all orders", description = "Fetch all orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(), "Orders retrieved successfully"));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get customer orders", description = "Fetch all orders placed by a customer")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByCustomer(customerId), "Orders retrieved successfully"));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Get restaurant orders", description = "Fetch all orders for a restaurant")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByRestaurant(restaurantId), "Orders retrieved successfully"));
    }

    @GetMapping("/api/v1/orders")
    public List<OrderResponse> getOrders(@RequestParam(value = "status", required = false) OrderStatus status) {
        if (status != null) {
            List<OrderResponse> orders = orderService.getOrdersByStatus(status);
            orders.forEach(order -> {
                System.out.println(order.toString());
            });
            return orders;

        } else {
            return orderService.getAllOrders();
        }
    }


    @GetMapping("/date/{date:\\d{4}-\\d{2}-\\d{2}}")
    @Operation(summary = "Filter by date", description = "Get orders placed on a specific date")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByDate(date), "Orders retrieved successfully"));
    }

    @GetMapping("/amount-range")
    @Operation(summary = "Filter by amount range", description = "Get orders within specified amount range")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByAmountRange(
            @RequestParam(name = "min", required = false) Double min,
            @RequestParam(name = "max", required = false) Double max,
            @RequestParam(name = "minAmount", required = false) Double minAmount,
            @RequestParam(name = "maxAmount", required = false) Double maxAmount) {
        // Support both parameter names for flexibility
        Double minValue = minAmount != null ? minAmount : min;
        Double maxValue = maxAmount != null ? maxAmount : max;
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByAmountRange(minValue, maxValue), "Orders retrieved successfully"));
    }

    @GetMapping("/amount")
    @Operation(summary = "Filter by amount range (alternative)", description = "Get orders within specified amount range using minAmount and maxAmount parameters")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByAmount(
            @RequestParam Double minAmount,
            @RequestParam Double maxAmount) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByAmountRange(minAmount, maxAmount), "Orders retrieved successfully"));
    }

    @GetMapping("/by-date")
    @Operation(summary = "Filter by date (query parameter)", description = "Get orders placed on a specific date using query parameter")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByDateQuery(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByDate(date), "Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Fetch order details using order ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Order retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Change order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        log.info("Updating order status for id: {} to: {}", id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, request), "Order status updated successfully"));
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        log.info("Cancelling order with id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(orderService.cancelOrder(id), "Order cancelled successfully"));
    }
}
