package com.food.repository;

import com.food.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantRestaurantId(Long restaurantId);
    List<MenuItem> findByPriceGreaterThan(Double price);
    List<MenuItem> findByItemNameContainingIgnoreCase(String name);
}
