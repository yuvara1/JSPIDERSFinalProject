package com.food.service;

import com.food.dto.request.OrderRequest;
import com.food.dto.request.UpdateOrderStatusRequest;
import com.food.dto.response.OrderResponse;
import com.food.enums.OrderStatus;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(OrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getOrdersByCustomer(Long customerId);
    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);
    List<OrderResponse> getOrdersByStatus(OrderStatus status);
    List<OrderResponse> getOrdersByDate(LocalDate date);
    List<OrderResponse> getOrdersByAmountRange(Double min, Double max);
    List<OrderResponse> getOrdersByRestaurant(Long restaurantId);
    OrderResponse cancelOrder(Long id);
}
