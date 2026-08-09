package com.tcs.plts.service;

import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.AuthRequests;
import com.tcs.plts.dto.AuthResponse;
import com.tcs.plts.entity.Organization;
import com.tcs.plts.entity.OtpToken;
import com.tcs.plts.entity.Stakeholder;
import com.tcs.plts.entity.User;
import com.tcs.plts.repository.OrganizationRepository;
import com.tcs.plts.repository.OtpTokenRepository;
import com.tcs.plts.repository.StakeholderRepository;
import com.tcs.plts.repository.UserRepository;
import com.tcs.plts.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final StakeholderRepository stakeholderRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Transactional
    public void registerOrganization(AuthRequests.OrgRegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }
        if (organizationRepository.existsByCompanyRegistrationNumber(request.getCompanyRegistrationNumber())) {
            throw new IllegalArgumentException("Company Registration Number already registered");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ORGANIZATION)
                .verified(false)
                .active(true)
                .build();
        userRepository.save(user);

        Organization org = Organization.builder()
                .name(request.getName())
                .email(email)
                .phone(request.getPhone())
                .address(request.getAddress())
                .gstNumber(request.getGstNumber())
                .companyRegistrationNumber(request.getCompanyRegistrationNumber())
                .user(user)
                .build();
        organizationRepository.save(org);

        // Generate and send OTP
        String otp = generateOtpCode();
        saveOtp(email, otp, "ORG_REGISTRATION");
        emailService.sendEmail(email, "PLTS Organization Verification OTP",
                emailService.buildOtpTemplate(request.getName(), otp));
    }

    @Transactional
    public AuthResponse verifyOrgOtp(AuthRequests.VerifyOtpRequest request) {
        String email = normalizeEmail(request.getIdentifier());
        OtpToken otpToken = getValidOtp(email, request.getOtp(), "ORG_REGISTRATION");

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setVerified(true);
        userRepository.save(user);

        Organization org = organizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null);
        String token = jwtUtils.generateToken(auth, user.getEmail(), user.getRole().name(), null);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .name(org.getName())
                .companyName(org.getName())
                .organizationId(org.getId())
                .verified(true)
                .build();
    }

    @Transactional
    public void sendOrgLoginOtp(AuthRequests.OrgLoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new IllegalStateException("Organization email is not verified. Please verify via OTP.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        Organization org = organizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization profile not found"));

        String otp = generateOtpCode();
        saveOtp(user.getEmail(), otp, "ORG_LOGIN");
        emailService.sendEmail(user.getEmail(), "PLTS Organization Login OTP",
                emailService.buildOtpTemplate(org.getName(), otp));
    }

    @Transactional
    public AuthResponse verifyOrgLoginOtp(AuthRequests.VerifyOtpRequest request) {
        String email = normalizeEmail(request.getIdentifier());
        OtpToken otpToken = getValidOtp(email, request.getOtp(), "ORG_LOGIN");

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Organization org = organizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization profile not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null);
        String token = jwtUtils.generateToken(authentication, user.getEmail(), user.getRole().name(), null);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .name(org.getName())
                .companyName(org.getName())
                .organizationId(org.getId())
                .verified(user.isVerified())
                .build();
    }

    @Transactional
    public void sendStakeholderOtp(AuthRequests.StakeholderLoginRequest request) {
        Stakeholder stakeholder = stakeholderRepository.findByGeneratedUserId(request.getGeneratedUserId())
                .orElseThrow(() -> new IllegalArgumentException("Stakeholder not found with User ID: " + request.getGeneratedUserId()));

        String otp = generateOtpCode();
        saveOtp(stakeholder.getGeneratedUserId(), otp, "STAKEHOLDER_LOGIN");

        emailService.sendEmail(stakeholder.getCompanyEmail(), "PLTS Stakeholder Login OTP",
                emailService.buildOtpTemplate(stakeholder.getCompanyName(), otp));
    }

    @Transactional
    public AuthResponse verifyStakeholderOtp(AuthRequests.VerifyOtpRequest request) {
        OtpToken otpToken = otpTokenRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(request.getIdentifier(), "STAKEHOLDER_LOGIN")
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (otpToken.isExpired() || !otpToken.getCode().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP code");
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        Stakeholder stakeholder = stakeholderRepository.findByGeneratedUserId(request.getIdentifier())
                .orElseThrow(() -> new IllegalArgumentException("Stakeholder not found"));

        User user = stakeholder.getUser();
        if (user == null) {
            user = userRepository.findByGeneratedUserId(stakeholder.getGeneratedUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User record missing for stakeholder"));
        }

        Authentication auth = new UsernamePasswordAuthenticationToken(user.getGeneratedUserId(), null);
        String token = jwtUtils.generateToken(auth, user.getEmail(), user.getRole().name(), user.getGeneratedUserId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .generatedUserId(user.getGeneratedUserId())
                .role(user.getRole())
                .name(stakeholder.getPersonInCharge())
                .companyName(stakeholder.getCompanyName())
                .organizationId(stakeholder.getOrganization().getId())
                .verified(true)
                .build();
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    private void saveOtp(String identifier, String code, String purpose) {
        otpTokenRepository.deleteByIdentifierAndPurpose(identifier, purpose);
        OtpToken otpToken = OtpToken.builder()
                .identifier(identifier)
                .code(code)
                .purpose(purpose)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        otpTokenRepository.save(otpToken);
    }

    private OtpToken getValidOtp(String identifier, String otp, String purpose) {
        OtpToken otpToken = otpTokenRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(identifier, purpose)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (otpToken.isExpired() || !otpToken.getCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP code");
        }
        return otpToken;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
