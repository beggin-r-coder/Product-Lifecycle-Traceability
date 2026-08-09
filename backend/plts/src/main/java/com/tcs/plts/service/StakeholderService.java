package com.tcs.plts.service;

import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.StakeholderDto;
import com.tcs.plts.entity.AuditLog;
import com.tcs.plts.entity.Organization;
import com.tcs.plts.entity.Stakeholder;
import com.tcs.plts.entity.User;
import com.tcs.plts.repository.AuditLogRepository;
import com.tcs.plts.repository.OrganizationRepository;
import com.tcs.plts.repository.StakeholderRepository;
import com.tcs.plts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StakeholderService {

    private final StakeholderRepository stakeholderRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;

    @Transactional
    public StakeholderDto.Response createStakeholder(Long organizationId, StakeholderDto.CreateRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        String prefix = getRolePrefix(request.getRole());
        long count = stakeholderRepository.countByRole(request.getRole()) + 1;
        String generatedUserId = String.format("%s-%06d", prefix, count);

        // Ensure unique generated ID
        while (userRepository.existsByGeneratedUserId(generatedUserId)) {
            count++;
            generatedUserId = String.format("%s-%06d", prefix, count);
        }

        // Create User for Stakeholder
        User user = User.builder()
                .email(request.getCompanyEmail())
                .generatedUserId(generatedUserId)
                .role(request.getRole())
                .verified(true)
                .active(true)
                .build();
        userRepository.save(user);

        // Create Stakeholder
        Stakeholder stakeholder = Stakeholder.builder()
                .generatedUserId(generatedUserId)
                .role(request.getRole())
                .companyName(request.getCompanyName())
                .companyEmail(request.getCompanyEmail())
                .personInCharge(request.getPersonInCharge())
                .phone(request.getPhone())
                .address(request.getAddress())
                .notes(request.getNotes())
                .organization(org)
                .user(user)
                .active(true)
                .build();
        stakeholderRepository.save(stakeholder);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .action("STAKEHOLDER_CREATED")
                .performedBy(org.getName())
                .role(Role.ORGANIZATION)
                .resource("Stakeholder: " + generatedUserId)
                .details("Created " + request.getRole() + ": " + request.getCompanyName())
                .build());

        // Send Immediate Welcome Email with Generated ID
        emailService.sendEmail(
                request.getCompanyEmail(),
                "Welcome to Lifecycle Traceability - Account Credentials",
                emailService.buildStakeholderWelcomeTemplate(request.getCompanyName(), request.getRole().name(), generatedUserId)
        );

        return mapToResponse(stakeholder);
    }

    public List<StakeholderDto.Response> getStakeholdersByOrg(Long organizationId, Role role) {
        List<Stakeholder> list = (role != null)
                ? stakeholderRepository.findByOrganizationIdAndRole(organizationId, role)
                : stakeholderRepository.findByOrganizationId(organizationId);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public StakeholderDto.Response getStakeholderById(Long id) {
        Stakeholder s = stakeholderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stakeholder not found"));
        return mapToResponse(s);
    }

    private String getRolePrefix(Role role) {
        return switch (role) {
            case MANUFACTURER -> "MAN";
            case QA -> "QA";
            case PACKAGING_TRANSPORT -> "PT";
            case RETAILER -> "RET";
            default -> "STK";
        };
    }

    public StakeholderDto.Response mapToResponse(Stakeholder s) {
        return StakeholderDto.Response.builder()
                .id(s.getId())
                .generatedUserId(s.getGeneratedUserId())
                .role(s.getRole())
                .companyName(s.getCompanyName())
                .companyEmail(s.getCompanyEmail())
                .personInCharge(s.getPersonInCharge())
                .phone(s.getPhone())
                .address(s.getAddress())
                .notes(s.getNotes())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
