package com.food.repository;

import com.food.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByRestaurantNameContainingIgnoreCase(String restaurantName);


    List<Restaurant> findByLocationContainingIgnoreCase(String location);
    Page<Restaurant> findAll(Pageable pageable);
}
