package com.food.service;

import com.food.dto.request.MenuItemRequest;
import com.food.dto.request.UpdatePriceRequest;
import com.food.dto.response.MenuItemResponse;

import java.util.List;

public interface MenuItemService {
    MenuItemResponse addMenuItem(MenuItemRequest request);
    List<MenuItemResponse> getAllMenuItems();
    MenuItemResponse getMenuItemById(Long id);
    MenuItemResponse updatePrice(Long id, UpdatePriceRequest request);
    void deleteMenuItem(Long id);
    List<MenuItemResponse> getItemsWithPriceGreaterThan(Double price);
    List<MenuItemResponse> getItemsByName(String name);
}
