package com.food.service.impl;

import com.food.dto.request.UpdatePaymentStatusRequest;
import com.food.dto.response.PaymentResponse;
import com.food.entity.Payment;
import com.food.enums.PaymentMethod;
import com.food.enums.PaymentStatus;
import com.food.exception.ResourceNotFoundException;
import com.food.repository.PaymentRepository;
import com.food.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentResponse getPaymentById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByPaymentStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getPaymentsByMethod(PaymentMethod method) {
        return paymentRepository.findByPaymentMethod(method).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponse updatePaymentStatus(Long id, UpdatePaymentStatusRequest request) {
        Payment payment = findById(id);
        payment.setPaymentStatus(request.getPaymentStatus());
        paymentRepository.save(payment);
        log.info("Payment status updated successfully for id: {}", id);
        return toResponse(payment);
    }

    private Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Payment not found with id: {}", id);
                    return new ResourceNotFoundException("Payment not found with id: " + id);
                });
    }

    public PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .amount(p.getAmount())
                .build();
    }
}
