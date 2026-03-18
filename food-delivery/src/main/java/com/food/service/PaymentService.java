package com.food.service;

import com.food.dto.request.UpdatePaymentStatusRequest;
import com.food.dto.response.PaymentResponse;
import com.food.enums.PaymentMethod;
import com.food.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getPaymentsByStatus(PaymentStatus status);
    List<PaymentResponse> getPaymentsByMethod(PaymentMethod method);
    PaymentResponse updatePaymentStatus(Long id, UpdatePaymentStatusRequest request);
}
