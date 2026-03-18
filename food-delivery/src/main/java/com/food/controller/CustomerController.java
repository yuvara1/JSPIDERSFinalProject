package com.food.controller;

import com.food.dto.request.CustomerRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.CustomerResponse;
import com.food.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management endpoints")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create customer", description = "Register a new customer")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        log.info("Creating customer with email: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        customerService.createCustomer(request),
                        "Customer created successfully"
                ));
    }

    @GetMapping
    @Operation(summary = "Get all customers", description = "Fetch all customers from database")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(
                customerService.getAllCustomers(),
                "Customers retrieved successfully"
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Fetch customer details using customer ID")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                customerService.getCustomerById(id),
                "Customer retrieved successfully"
        ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Update existing customer details")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        log.info("Updating customer with id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(
                customerService.updateCustomer(id, request),
                "Customer updated successfully"
        ));
    }

    @GetMapping("/contact/{contact}")
    @Operation(summary = "Get customer by contact", description = "Fetch customer using phone contact")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerByContact(@PathVariable String contact) {
        return ResponseEntity.ok(ApiResponse.success(
                customerService.getCustomerByContact(contact),
                "Customer retrieved successfully"
        ));
    }
}
