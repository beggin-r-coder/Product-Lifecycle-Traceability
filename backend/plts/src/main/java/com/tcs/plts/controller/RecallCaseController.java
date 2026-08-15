package com.tcs.plts.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tcs.plts.common.enums.RecallStatus;
import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.RecallCaseDto;
import com.tcs.plts.entity.DefectCase;
import com.tcs.plts.entity.RecallCase;
import com.tcs.plts.service.RecallImpactAnalysisService;
import com.tcs.plts.repository.DefectCaseRepository;
import com.tcs.plts.repository.RecallCaseRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recalls")
@RequiredArgsConstructor
public class RecallCaseController {

    private final RecallCaseRepository recallCaseRepository;
    private final DefectCaseRepository defectCaseRepository;
    private final RecallImpactAnalysisService recallImpactAnalysisService;
    private final ObjectMapper objectMapper;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<RecallCaseDto.Response>> initiateRecall(
            @Valid @RequestBody RecallCaseDto.CreateRequest request) {
        
        String recallId = generateRecallId();
        
        DefectCase defectCase = defectCaseRepository.findById(request.getDefectCaseId())
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        RecallCase recallCase = RecallCase.builder()
                .recallId(recallId)
                .defectCase(defectCase)
                .recallScope(request.getRecallScope())
                .affectedProductCount(request.getAffectedProductCount())
                .affectedBatches(convertListToJson(request.getAffectedBatches()))
                .initiatedBy(request.getInitiatedBy())
                .initiatedByName(request.getInitiatedByName())
                .approvedBy(request.getApprovedBy())
                .approvedByName(request.getApprovedByName())
                .status(RecallStatus.DRAFT)
                .priority(request.getPriority())
                .recallReason(request.getRecallReason())
                .affectedRetailers(convertListToJson(request.getAffectedRetailers()))
                .affectedTransportPartners(convertListToJson(request.getAffectedTransportPartners()))
                .estimatedCost(request.getEstimatedCost())
                .estimatedCompletionDate(request.getEstimatedCompletionDate())
                .build();
        
        recallCase = recallCaseRepository.save(recallCase);
        
        RecallCaseDto.Response response = convertToResponse(recallCase);
        return ResponseEntity.ok(ApiResponse.success("Recall initiated successfully", response));
    }

    @PutMapping("/{recallId}/approve")
    public ResponseEntity<ApiResponse<RecallCaseDto.Response>> approveRecall(
            @PathVariable String recallId) {
        
        RecallCase recallCase = recallCaseRepository.findByRecallId(recallId)
                .orElseThrow(() -> new RuntimeException("Recall case not found"));
        
        recallCase.setStatus(RecallStatus.APPROVED);
        recallCase = recallCaseRepository.save(recallCase);
        
        RecallCaseDto.Response response = convertToResponse(recallCase);
        return ResponseEntity.ok(ApiResponse.success("Recall approved successfully", response));
    }

    @PutMapping("/{recallId}/status")
    public ResponseEntity<ApiResponse<RecallCaseDto.Response>> updateRecallStatus(
            @PathVariable String recallId,
            @RequestBody RecallCaseDto.UpdateStatusRequest request) {
        
        RecallCase recallCase = recallCaseRepository.findByRecallId(recallId)
                .orElseThrow(() -> new RuntimeException("Recall case not found"));
        
        recallCase.setStatus(request.getStatus());
        recallCase = recallCaseRepository.save(recallCase);
        
        RecallCaseDto.Response response = convertToResponse(recallCase);
        return ResponseEntity.ok(ApiResponse.success("Recall status updated successfully", response));
    }

    @GetMapping("/{recallId}")
    public ResponseEntity<ApiResponse<RecallCaseDto.Response>> getRecallCase(
            @PathVariable String recallId) {
        
        RecallCase recallCase = recallCaseRepository.findByRecallId(recallId)
                .orElseThrow(() -> new RuntimeException("Recall case not found"));
        
        RecallCaseDto.Response response = convertToResponse(recallCase);
        return ResponseEntity.ok(ApiResponse.success("Recall case retrieved", response));
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<ApiResponse<List<RecallCaseDto.Response>>> getOrganizationRecalls(
            @PathVariable Long orgId) {
        
        List<RecallCase> recallCases = recallCaseRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        List<RecallCaseDto.Response> responses = recallCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Organization recalls retrieved", responses));
    }

    @GetMapping("/defect/{defectCaseId}")
    public ResponseEntity<ApiResponse<List<RecallCaseDto.Response>>> getDefectRecalls(
            @PathVariable Long defectCaseId) {
        
        List<RecallCase> recallCases = recallCaseRepository.findByDefectCaseId(defectCaseId);
        List<RecallCaseDto.Response> responses = recallCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Defect recalls retrieved", responses));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<RecallCaseDto.Response>>> getRecallsByStatus(
            @PathVariable RecallStatus status) {
        
        List<RecallCase> recallCases = recallCaseRepository.findByStatus(status);
        List<RecallCaseDto.Response> responses = recallCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Recalls retrieved", responses));
    }

    @GetMapping("/{recallId}/impact-report")
    public ResponseEntity<ApiResponse<RecallCaseDto.RecallImpactReport>> getImpactReport(
            @PathVariable String recallId) {
        
        RecallCase recallCase = recallCaseRepository.findByRecallId(recallId)
                .orElseThrow(() -> new RuntimeException("Recall case not found"));
        
        List<String> affectedBatches = parseJsonList(recallCase.getAffectedBatches());
        String batchId = affectedBatches.isEmpty() ? "UNKNOWN" : affectedBatches.get(0);
        
        RecallCaseDto.RecallImpactReport report = 
                recallImpactAnalysisService.generateRecallImpactReport(batchId, recallCase.getId());
        report.setRecallId(recallId);
        
        return ResponseEntity.ok(ApiResponse.success("Impact report generated", report));
    }

    @GetMapping("/metrics/organization/{orgId}")
    public ResponseEntity<ApiResponse<RecallCaseDto.RecallMetrics>> getRecallMetrics(
            @PathVariable Long orgId) {
        
        RecallCaseDto.RecallMetrics metrics = 
                recallImpactAnalysisService.generateRecallMetrics(orgId);
        
        return ResponseEntity.ok(ApiResponse.success("Recall metrics retrieved", metrics));
    }

    private String generateRecallId() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long sequence = System.currentTimeMillis() % 10000;
        return "REC-" + timestamp + "-" + String.format("%04d", sequence);
    }

    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    private RecallCaseDto.Response convertToResponse(RecallCase recallCase) {
        return RecallCaseDto.Response.builder()
                .id(recallCase.getId())
                .recallId(recallCase.getRecallId())
                .defectCaseId(recallCase.getDefectCase().getId())
                .defectCaseIdString(recallCase.getDefectCase().getDefectCaseId())
                .recallScope(recallCase.getRecallScope())
                .affectedProductCount(recallCase.getAffectedProductCount())
                .affectedBatches(parseJsonList(recallCase.getAffectedBatches()))
                .initiatedBy(recallCase.getInitiatedBy())
                .initiatedByName(recallCase.getInitiatedByName())
                .approvedBy(recallCase.getApprovedBy())
                .approvedByName(recallCase.getApprovedByName())
                .status(recallCase.getStatus())
                .priority(recallCase.getPriority())
                .recallReason(recallCase.getRecallReason())
                .affectedRetailers(parseJsonList(recallCase.getAffectedRetailers()))
                .affectedTransportPartners(parseJsonList(recallCase.getAffectedTransportPartners()))
                .estimatedCost(recallCase.getEstimatedCost())
                .estimatedCompletionDate(recallCase.getEstimatedCompletionDate())
                .createdAt(recallCase.getCreatedAt())
                .completedAt(recallCase.getCompletedAt())
                .build();
    }
}
