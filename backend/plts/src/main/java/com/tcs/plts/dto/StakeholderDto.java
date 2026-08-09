package com.tcs.plts.dto;

import com.tcs.plts.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class StakeholderDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Company email is required")
        @Email(message = "Invalid email format")
        private String companyEmail;

        @NotBlank(message = "Person in charge is required")
        private String personInCharge;

        private String phone;
        private String address;
        private String notes;

        @NotNull(message = "Role is required (MANUFACTURER, QA, PACKAGING_TRANSPORT, RETAILER)")
        private Role role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private String generatedUserId;
        private Role role;
        private String companyName;
        private String companyEmail;
        private String personInCharge;
        private String phone;
        private String address;
        private String notes;
        private boolean active;
        private LocalDateTime createdAt;
    }
}
