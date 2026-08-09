package com.tcs.plts.controller;

import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.AuthRequests;
import com.tcs.plts.dto.AuthResponse;
import com.tcs.plts.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-org")
    public ResponseEntity<ApiResponse<Void>> registerOrg(@Valid @RequestBody AuthRequests.OrgRegisterRequest request) {
        authService.registerOrganization(request);
        return ResponseEntity.ok(ApiResponse.success("Organization registered successfully. Verification OTP sent to email."));
    }

    @PostMapping("/verify-org-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOrgOtp(@Valid @RequestBody AuthRequests.VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOrgOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Organization email verified successfully", response));
    }

    @PostMapping("/login-org")
    public ResponseEntity<ApiResponse<Void>> loginOrg(@Valid @RequestBody AuthRequests.OrgLoginRequest request) {
        authService.sendOrgLoginOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Login OTP sent to your registered email."));
    }

    @PostMapping("/verify-org-login-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOrgLoginOtp(@Valid @RequestBody AuthRequests.VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOrgLoginOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Organization login successful", response));
    }

    @PostMapping("/send-stakeholder-otp")
    public ResponseEntity<ApiResponse<Void>> sendStakeholderOtp(@Valid @RequestBody AuthRequests.StakeholderLoginRequest request) {
        authService.sendStakeholderOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to registered stakeholder email."));
    }

    @PostMapping("/verify-stakeholder-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyStakeholderOtp(@Valid @RequestBody AuthRequests.VerifyOtpRequest request) {
        AuthResponse response = authService.verifyStakeholderOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder login successful", response));
    }
}
