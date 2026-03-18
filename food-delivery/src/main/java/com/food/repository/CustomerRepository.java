package com.food.repository;

import com.food.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByContact(String contact);
    boolean existsByEmail(String email);
    boolean existsByContact(String contact);
    boolean existsByEmailAndCustomerIdNot(String email, Long id);
    boolean existsByContactAndCustomerIdNot(String contact, Long id);
}
