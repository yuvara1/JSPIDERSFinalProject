package com.food.repository;

import com.food.entity.Order;
import com.food.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerCustomerId(Long customerId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByRestaurantRestaurantId(Long restaurantId);

    @Query("SELECT o FROM Order o WHERE DATE(o.orderDateTime) = :date")
    List<Order> findByOrderDate(@Param("date") LocalDate date);

    @Query("SELECT o FROM Order o WHERE o.totalAmount BETWEEN :min AND :max")
    List<Order> findByTotalAmountBetween(@Param("min") Double min, @Param("max") Double max);
}
