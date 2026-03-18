package com.food.service.impl;

import com.food.dto.request.OrderRequest;
import com.food.dto.request.UpdateOrderStatusRequest;
import com.food.dto.response.OrderItemResponse;
import com.food.dto.response.OrderResponse;
import com.food.dto.response.PaymentResponse;
import com.food.entity.*;
import com.food.enums.OrderStatus;
import com.food.enums.PaymentStatus;
import com.food.exception.BusinessException;
import com.food.exception.ResourceNotFoundException;
import com.food.repository.*;
import com.food.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        log.debug("Processing order placement for customer id: {}, restaurant id: {}", request.getCustomerId(), request.getRestaurantId());
        // Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> {
                    log.error("Order placement failed: Customer not found with id: {}", request.getCustomerId());
                    return new ResourceNotFoundException(
                            "Customer not found with id: " + request.getCustomerId());
                });

        // Validate restaurant
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> {
                    log.error("Order placement failed: Restaurant not found with id: {}", request.getRestaurantId());
                    return new ResourceNotFoundException(
                            "Restaurant not found with id: " + request.getRestaurantId());
                });

        // Validate order has at least one item
        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            log.error("Order placement failed: Order must contain at least one item");
            throw new BusinessException("Order must contain at least one item");
        }

        // Build order items and calculate total
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (var itemReq : request.getOrderItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> {
                        log.error("Order placement failed: Menu item not found with id: {}", itemReq.getItemId());
                        return new ResourceNotFoundException(
                                "Menu item not found with id: " + itemReq.getItemId());
                    });

            if (!menuItem.getAvailability()) {
                log.error("Order placement failed: Menu item '{}' is currently unavailable", menuItem.getItemName());
                throw new BusinessException("Menu item '" + menuItem.getItemName() + "' is currently unavailable");
            }

            double subtotal = menuItem.getPrice() * itemReq.getQuantity();
            totalAmount += subtotal;

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .subtotal(subtotal)
                    .build();
            orderItems.add(orderItem);
        }

        // Create payment
        Payment payment = Payment.builder()
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(totalAmount)
                .build();
        payment = paymentRepository.save(payment);

        // Create order
        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .payment(payment)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        // Link order items to order
        final Order savedOrder = orderRepository.save(order);
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
        }
        savedOrder.setOrderItems(orderItems);
        orderRepository.save(savedOrder);
        log.info("Order placed successfully with id: {}, total amount: {}", savedOrder.getOrderId(), totalAmount);

        return toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            log.error("Customer not found with id: {}", customerId);
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        return orderRepository.findByCustomerCustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = findById(id);
        order.setStatus(request.getStatus());
        orderRepository.save(order);
        log.info("Order status updated successfully for order id: {}", id);
        return toResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByDate(LocalDate date) {
        return orderRepository.findByOrderDate(date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByAmountRange(Double min, Double max) {
        // Validate min <= max for amount range filtering
        if (min > max) {
            log.error("Invalid amount range: min {} is greater than max {}", min, max);
            throw new BusinessException("Minimum amount cannot be greater than maximum amount");
        }
        return orderRepository.findByTotalAmountBetween(min, max).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByRestaurant(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            log.error("Restaurant not found with id: {}", restaurantId);
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
        return orderRepository.findByRestaurantRestaurantId(restaurantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = findById(id);
        // Cancellation only allowed for PENDING orders
        if (order.getStatus() != OrderStatus.PENDING) {
            log.error("Order cancellation failed: Order id {} has status {}. Cancellation only allowed for PENDING orders.", id, order.getStatus());
            throw new BusinessException(
                    "Order cannot be cancelled. Current status: " + order.getStatus() +
                    ". Cancellation is only allowed for PENDING orders.");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Order cancelled successfully with id: {}", id);
        return toResponse(order);
    }


    private Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getOrderItems() == null ? List.of() :
                o.getOrderItems().stream().map(oi -> OrderItemResponse.builder()
                        .orderItemId(oi.getOrderItemId())
                        .itemId(oi.getMenuItem().getItemId())
                        .itemName(oi.getMenuItem().getItemName())
                        .quantity(oi.getQuantity())
                        .subtotal(oi.getSubtotal())
                        .build()
                ).collect(Collectors.toList());

        PaymentResponse paymentResponse = o.getPayment() == null ? null :
                PaymentResponse.builder()
                        .paymentId(o.getPayment().getPaymentId())
                        .paymentMethod(o.getPayment().getPaymentMethod())
                        .paymentStatus(o.getPayment().getPaymentStatus())
                        .amount(o.getPayment().getAmount())
                        .build();

        return OrderResponse.builder()
                .orderId(o.getOrderId())
                .orderDateTime(o.getOrderDateTime())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .customerId(o.getCustomer().getCustomerId())
                .customerName(o.getCustomer().getCustomerName())
                .restaurantId(o.getRestaurant().getRestaurantId())
                .restaurantName(o.getRestaurant().getRestaurantName())
                .payment(paymentResponse)
                .orderItems(itemResponses)
                .build();
    }
}
