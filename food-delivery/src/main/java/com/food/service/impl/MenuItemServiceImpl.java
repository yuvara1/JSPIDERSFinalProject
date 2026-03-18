package com.food.service.impl;

import com.food.dto.request.MenuItemRequest;
import com.food.dto.request.UpdatePriceRequest;
import com.food.dto.response.MenuItemResponse;
import com.food.entity.MenuItem;
import com.food.entity.Restaurant;
import com.food.exception.ResourceNotFoundException;
import com.food.repository.MenuItemRepository;
import com.food.repository.RestaurantRepository;
import com.food.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public MenuItemResponse addMenuItem(MenuItemRequest request) {
        log.debug("Adding menu item: {} for restaurant id: {}", request.getItemName(), request.getRestaurantId());
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> {
                    log.error("Menu item creation failed: Restaurant not found with id: {}", request.getRestaurantId());
                    return new ResourceNotFoundException(
                            "Restaurant not found with id: " + request.getRestaurantId());
                });

        MenuItem item = MenuItem.builder()
                .itemName(request.getItemName())
                .price(request.getPrice())
                .availability(request.getAvailability() != null ? request.getAvailability() : true)
                .restaurant(restaurant)
                .build();
        MenuItem savedItem = menuItemRepository.save(item);
        log.info("Menu item created successfully with id: {}, name: {}", savedItem.getItemId(), savedItem.getItemName());
        return toResponse(savedItem);
    }

    @Override
    public List<MenuItemResponse> getAllMenuItems() {
        log.debug("Fetching all menu items from database");
        return menuItemRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MenuItemResponse getMenuItemById(Long id) {
        log.debug("Fetching menu item with id: {}", id);
        return toResponse(findById(id));
    }

    @Override
    public MenuItemResponse updatePrice(Long id, UpdatePriceRequest request) {
        log.debug("Updating price for menu item id: {} to: {}", id, request.getPrice());
        MenuItem item = findById(id);
        item.setPrice(request.getPrice());
        menuItemRepository.save(item);
        log.info("Menu item price updated successfully for id: {}", id);
        return toResponse(item);
    }

    @Override
    public void deleteMenuItem(Long id) {
        log.debug("Deleting menu item with id: {}", id);
        if (!menuItemRepository.existsById(id)) {
            log.error("Menu item deletion failed: Menu item not found with id: {}", id);
            throw new ResourceNotFoundException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
        log.info("Menu item deleted successfully with id: {}", id);
    }

    @Override
    public List<MenuItemResponse> getItemsWithPriceGreaterThan(Double price) {
        log.debug("Fetching menu items with price greater than: {}", price);
        return menuItemRepository.findByPriceGreaterThan(price).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuItemResponse> getItemsByName(String name) {
        log.debug("Fetching menu items with name containing: {}", name);
        return menuItemRepository.findByItemNameContainingIgnoreCase(name).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MenuItem findById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Menu item not found with id: {}", id);
                    return new ResourceNotFoundException("Menu item not found with id: " + id);
                });
    }

    private MenuItemResponse toResponse(MenuItem m) {
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
