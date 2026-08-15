package com.tcs.plts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthRequests {

    @Data
    public static class OrgRegisterRequest {
        @NotBlank(message = "Organization name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private String phone;
        private String address;
        private String gstNumber;
        private String companyRegistrationNumber;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank(message = "Identifier (Email or User ID) is required")
        private String identifier;

        @NotBlank(message = "OTP code is required")
        private String otp;
    }

    @Data
    public static class OrgLoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class StakeholderLoginRequest {
        @NotBlank(message = "Generated User ID is required (e.g. MAN-000001)")
        private String generatedUserId;
    }
}
