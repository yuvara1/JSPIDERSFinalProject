package com.food.controller;

import com.food.dto.request.UpdatePaymentStatusRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.PaymentResponse;
import com.food.enums.PaymentMethod;
import com.food.enums.PaymentStatus;
import com.food.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID", description = "Fetch payment details")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id), "Payment retrieved successfully"));
    }

    @GetMapping("/status")
    @Operation(summary = "Get payments by status (query param)", description = "Filter payments by payment status using query parameter")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByStatusQuery(@RequestParam PaymentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByStatus(status), "Payments retrieved successfully"));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get payments by status", description = "Filter payments by payment status")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByStatus(status), "Payments retrieved successfully"));
    }

    @GetMapping("/method")
    @Operation(summary = "Get payments by method (query param)", description = "Filter payments by payment method using query parameter")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByMethodQuery(@RequestParam PaymentMethod method) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByMethod(method), "Payments retrieved successfully"));
    }

    @GetMapping("/method/{method}")
    @Operation(summary = "Get payments by method", description = "Filter payments by payment method")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByMethod(@PathVariable PaymentMethod method) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByMethod(method), "Payments retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update payment status", description = "Change payment status")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentStatusRequest request) {
        log.info("Updating payment status for id: {} to: {}", id, request.getPaymentStatus());
        return ResponseEntity.ok(ApiResponse.success(paymentService.updatePaymentStatus(id, request), "Payment status updated successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update payment status (query param)", description = "Change payment status using query parameter")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePaymentStatusByQuery(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        log.info("Updating payment status for id: {} to: {}", id, status);
        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setPaymentStatus(status);
        return ResponseEntity.ok(ApiResponse.success(paymentService.updatePaymentStatus(id, request), "Payment status updated successfully"));
    }
}
