package com.food.service;

import com.food.dto.request.CustomerRequest;
import com.food.dto.response.CustomerResponse;

import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerRequest request);
    List<CustomerResponse> getAllCustomers();
    CustomerResponse getCustomerById(Long id);
    CustomerResponse updateCustomer(Long id, CustomerRequest request);
    CustomerResponse getCustomerByContact(String contact);
}
