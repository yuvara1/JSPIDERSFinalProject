package com.food.service.impl;

import com.food.dto.request.RestaurantRequest;
import com.food.dto.response.MenuItemResponse;
import com.food.dto.response.RestaurantResponse;
import com.food.entity.MenuItem;
import com.food.entity.Restaurant;
import com.food.exception.ResourceNotFoundException;
import com.food.repository.MenuItemRepository;
import com.food.repository.RestaurantRepository;
import com.food.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public RestaurantResponse addRestaurant(RestaurantRequest request) {
        Restaurant restaurant = Restaurant.builder()
                .restaurantName(request.getRestaurantName())
                .location(request.getLocation())
                .build();
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created successfully with id: {}, name: {}", savedRestaurant.getRestaurantId(), savedRestaurant.getRestaurantName());
        return toResponse(savedRestaurant);
    }

    @Override
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantResponse getRestaurantById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        Restaurant restaurant = findById(id);
        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setLocation(request.getLocation());
        restaurantRepository.save(restaurant);
        log.info("Restaurant updated successfully with id: {}", id);
        return toResponse(restaurant);
    }

    @Override
    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) {
            log.error("Restaurant deletion failed: Restaurant not found with id: {}", id);
            throw new ResourceNotFoundException("Restaurant not found with id: " + id);
        }
        restaurantRepository.deleteById(id);
        log.info("Restaurant deleted successfully with id: {}", id);
    }

    @Override
    public RestaurantResponse getRestaurantByName(String name) {
        Restaurant restaurant = restaurantRepository.findByRestaurantNameIgnoreCase(name)
                .orElseThrow(() -> {
                    log.error("Restaurant not found with name: {}", name);
                    return new ResourceNotFoundException("Restaurant not found with name: " + name);
                });
        return toResponse(restaurant);
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByLocation(String location) {
        return restaurantRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId) {
        findById(restaurantId);
        return menuItemRepository.findByRestaurantRestaurantId(restaurantId).stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<RestaurantResponse> getRestaurantsWithPaginationAndSorting(int page, int size, String sortBy, String direction) {
        // Build sort order based on direction parameter
        Sort sort = direction.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return restaurantRepository.findAll(pageable).map(this::toResponse);
    }

    private Restaurant findById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Restaurant not found with id: {}", id);
                    return new ResourceNotFoundException("Restaurant not found with id: " + id);
                });
    }

    private RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .restaurantId(r.getRestaurantId())
                .restaurantName(r.getRestaurantName())
                .location(r.getLocation())
                .build();
    }

    private MenuItemResponse toMenuItemResponse(MenuItem m) {
        return MenuItemResponse.builder()
                .itemId(m.getItemId())
                .itemName(m.getItemName())
                .price(m.getPrice())
                .availability(m.getAvailability())
                .restaurantId(m.getRestaurant().getRestaurantId())
                .restaurantName(m.getRestaurant().getRestaurantName())
                .build();
    }
}
