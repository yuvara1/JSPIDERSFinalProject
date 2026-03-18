package com.food.service.impl;

import com.food.dto.request.CustomerRequest;
import com.food.dto.response.CustomerResponse;
import com.food.entity.Customer;
import com.food.exception.DuplicateResourceException;
import com.food.exception.ResourceNotFoundException;
import com.food.repository.CustomerRepository;
import com.food.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            log.error("Customer creation failed: Email already in use - {}", request.getEmail());
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }
        if (customerRepository.existsByContact(request.getContact())) {
            log.error("Customer creation failed: Contact already in use - {}", request.getContact());
            throw new DuplicateResourceException("Contact already in use: " + request.getContact());
        }
        Customer customer = Customer.builder()
                .customerName(request.getCustomerName())
                .email(request.getEmail())
                .contact(request.getContact())
                .address(request.getAddress())
                .build();
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer created successfully with id: {}", savedCustomer.getCustomerId());
        return toResponse(savedCustomer);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findById(id);
        // Validate email uniqueness excluding current customer
        if (customerRepository.existsByEmailAndCustomerIdNot(request.getEmail(), id)) {
            log.error("Customer update failed: Email already in use - {}", request.getEmail());
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }
        // Validate contact uniqueness excluding current customer
        if (customerRepository.existsByContactAndCustomerIdNot(request.getContact(), id)) {
            log.error("Customer update failed: Contact already in use - {}", request.getContact());
            throw new DuplicateResourceException("Contact already in use: " + request.getContact());
        }
        customer.setCustomerName(request.getCustomerName());
        customer.setEmail(request.getEmail());
        customer.setContact(request.getContact());
        customer.setAddress(request.getAddress());
        customerRepository.save(customer);
        log.info("Customer updated successfully with id: {}", id);
        return toResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByContact(String contact) {
        Customer customer = customerRepository.findByContact(contact)
                .orElseThrow(() -> {
                    log.error("Customer not found with contact: {}", contact);
                    return new ResourceNotFoundException("Customer not found with contact: " + contact);
                });
        return toResponse(customer);
    }

    private Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Customer not found with id: {}", id);
                    return new ResourceNotFoundException("Customer not found with id: " + id);
                });
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .customerId(c.getCustomerId())
                .customerName(c.getCustomerName())
                .email(c.getEmail())
                .contact(c.getContact())
                .address(c.getAddress())
                .build();
    }
}
