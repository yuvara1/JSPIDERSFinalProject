package com.food.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponse {
    private Long customerId;
    private String customerName;
    private String email;
    private String contact;
    private String address;
}
