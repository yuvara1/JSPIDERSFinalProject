package com.food.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private ApiError error;
    private LocalDateTime timestamp;
    

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ApiError.builder()
                        .code(errorCode)
                        .message(message)
                        .build())
                .timestamp(LocalDateTime.now())
                .build();
    }
    

    public static <T> ApiResponse<T> error(String message, String errorCode, Object details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ApiError.builder()
                        .code(errorCode)
                        .message(message)
                        .details(details)
                        .build())
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiError {
        private String code;
        private String message;
        private Object details;
    }
}

