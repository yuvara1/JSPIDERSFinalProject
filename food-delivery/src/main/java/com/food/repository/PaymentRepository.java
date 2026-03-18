package com.food.repository;

import com.food.entity.Payment;
import com.food.enums.PaymentMethod;
import com.food.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPaymentStatus(PaymentStatus status);
    List<Payment> findByPaymentMethod(PaymentMethod method);
}
