package com.tcs.plts.controller;

import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.StakeholderDto;
import com.tcs.plts.service.StakeholderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StakeholderController {

    private final StakeholderService stakeholderService;

    @PostMapping("/organizations/{orgId}/stakeholders")
    public ResponseEntity<ApiResponse<StakeholderDto.Response>> createStakeholder(
            @PathVariable Long orgId,
            @Valid @RequestBody StakeholderDto.CreateRequest request) {
        StakeholderDto.Response response = stakeholderService.createStakeholder(orgId, request);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder created successfully", response));
    }

    @GetMapping("/organizations/{orgId}/stakeholders")
    public ResponseEntity<ApiResponse<List<StakeholderDto.Response>>> getStakeholders(
            @PathVariable Long orgId,
            @RequestParam(required = false) Role role) {
        List<StakeholderDto.Response> list = stakeholderService.getStakeholdersByOrg(orgId, role);
        return ResponseEntity.ok(ApiResponse.success("Stakeholders retrieved successfully", list));
    }

    @GetMapping("/stakeholders/{id}")
    public ResponseEntity<ApiResponse<StakeholderDto.Response>> getStakeholderById(@PathVariable Long id) {
        StakeholderDto.Response response = stakeholderService.getStakeholderById(id);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder detail", response));
    }
}
