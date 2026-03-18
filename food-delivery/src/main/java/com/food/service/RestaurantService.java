package com.food.service;

import com.food.dto.request.RestaurantRequest;
import com.food.dto.response.MenuItemResponse;
import com.food.dto.response.RestaurantResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface RestaurantService {
    RestaurantResponse addRestaurant(RestaurantRequest request);
    List<RestaurantResponse> getAllRestaurants();
    RestaurantResponse getRestaurantById(Long id);
    RestaurantResponse updateRestaurant(Long id, RestaurantRequest request);
    void deleteRestaurant(Long id);
    RestaurantResponse getRestaurantByName(String name);
    List<RestaurantResponse> getRestaurantsByLocation(String location);
    List<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId);
    Page<RestaurantResponse> getRestaurantsWithPaginationAndSorting(int page, int size, String sortBy, String direction);
}
