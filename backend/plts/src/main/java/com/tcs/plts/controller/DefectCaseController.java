package com.tcs.plts.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tcs.plts.common.enums.DefectStatus;
import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.DefectCaseDto;
import com.tcs.plts.entity.DefectCase;
import com.tcs.plts.entity.Organization;
import com.tcs.plts.entity.Order;
import com.tcs.plts.service.BacktrackingEngineService;
import com.tcs.plts.service.RootCauseAnalysisService;
import com.tcs.plts.repository.DefectCaseRepository;
import com.tcs.plts.repository.OrganizationRepository;
import com.tcs.plts.repository.OrderRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/defects")
@RequiredArgsConstructor
public class DefectCaseController {

    private final DefectCaseRepository defectCaseRepository;
    private final OrganizationRepository organizationRepository;
    private final OrderRepository orderRepository;
    private final BacktrackingEngineService backtrackingEngineService;
    private final RootCauseAnalysisService rootCauseAnalysisService;
    private final ObjectMapper objectMapper;

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<DefectCaseDto.Response>> reportDefect(
            @Valid @RequestBody DefectCaseDto.CreateRequest request) {
        
        String defectCaseId = generateDefectCaseId();
        
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected order not found"));
            if (!order.getOrganization().getId().equals(organization.getId())) {
                throw new IllegalArgumentException("Selected order does not belong to this organization");
            }
        }
        
        DefectCase defectCase = DefectCase.builder()
                .defectCaseId(defectCaseId)
                .productQrCode(request.getProductQrCode())
                .productSerialNumber(request.getProductSerialNumber())
                .batchNumber(request.getBatchNumber())
                .order(order)
                .defectCategory(request.getDefectCategory())
                .severity(request.getSeverity())
                .description(request.getDescription())
                .quantityAffected(request.getQuantityAffected())
                .evidencePhotos(convertListToJson(request.getEvidencePhotos()))
                .evidenceDocuments(convertListToJson(request.getEvidenceDocuments()))
                .location(request.getLocation())
                .reportedByRole(request.getReportedByRole())
                .reportedById(request.getReportedById())
                .reportedByName(request.getReportedByName())
                .organization(organization)
                .status(DefectStatus.DEFECT_REPORTED)
                .build();
        
        defectCase = defectCaseRepository.save(defectCase);
        
        DefectCaseDto.Response response = convertToResponse(defectCase);
        return ResponseEntity.ok(ApiResponse.success("Defect reported successfully", response));
    }

    @GetMapping("/{defectCaseId}")
    public ResponseEntity<ApiResponse<DefectCaseDto.Response>> getDefectCase(
            @PathVariable String defectCaseId) {
        
        DefectCase defectCase = defectCaseRepository.findByDefectCaseId(defectCaseId)
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        DefectCaseDto.Response response = convertToResponse(defectCase);
        return ResponseEntity.ok(ApiResponse.success("Defect case retrieved", response));
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<ApiResponse<List<DefectCaseDto.Response>>> getOrganizationDefects(
            @PathVariable Long orgId) {
        
        List<DefectCase> defectCases = defectCaseRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        List<DefectCaseDto.Response> responses = defectCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Organization defects retrieved", responses));
    }

    @GetMapping("/stakeholder/{stakeholderId}")
    public ResponseEntity<ApiResponse<List<DefectCaseDto.Response>>> getStakeholderDefects(
            @PathVariable String stakeholderId,
            @RequestParam Role role) {
        
        List<DefectCase> defectCases = defectCaseRepository.findByReportedByRoleAndReportedById(role, stakeholderId);
        List<DefectCaseDto.Response> responses = defectCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Stakeholder defects retrieved", responses));
    }

    @PutMapping("/{defectCaseId}/investigation")
    public ResponseEntity<ApiResponse<DefectCaseDto.Response>> updateInvestigation(
            @PathVariable String defectCaseId,
            @RequestBody DefectCaseDto.UpdateInvestigationRequest request) {
        
        DefectCase defectCase = defectCaseRepository.findByDefectCaseId(defectCaseId)
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        if (request.getStatus() != null) {
            defectCase.setStatus(request.getStatus());
        }
        if (request.getInvestigationNotes() != null) {
            defectCase.setInvestigationNotes(request.getInvestigationNotes());
        }
        if (request.getRootCause() != null) {
            defectCase.setRootCause(request.getRootCause());
        }
        if (request.getRecallRequired() != null) {
            defectCase.setRecallRequired(request.getRecallRequired());
        }
        if (request.getCorrectiveActions() != null) {
            defectCase.setCorrectiveActions(request.getCorrectiveActions());
        }
        if (request.getContributingFactors() != null) {
            defectCase.setContributingFactors(request.getContributingFactors());
        }
        if (request.getSimilarHistoricalCases() != null) {
            defectCase.setSimilarHistoricalCases(convertListToJson(request.getSimilarHistoricalCases()));
        }
        
        defectCase = defectCaseRepository.save(defectCase);
        
        DefectCaseDto.Response response = convertToResponse(defectCase);
        return ResponseEntity.ok(ApiResponse.success("Investigation updated successfully", response));
    }

    @GetMapping("/{defectCaseId}/backtracking")
    public ResponseEntity<ApiResponse<List<DefectCaseDto.BacktrackingTimeline>>> getBacktrackingTimeline(
            @PathVariable String defectCaseId) {
        
        DefectCase defectCase = defectCaseRepository.findByDefectCaseId(defectCaseId)
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        List<DefectCaseDto.BacktrackingTimeline> timeline = backtrackingEngineService.backtrackProductHistory(
                defectCase.getProductSerialNumber(),
                defectCase.getOrder() != null ? defectCase.getOrder().getId() : null
        );
        
        return ResponseEntity.ok(ApiResponse.success("Backtracking timeline retrieved", timeline));
    }

    @GetMapping("/{defectCaseId}/affected-products")
    public ResponseEntity<ApiResponse<List<DefectCaseDto.AffectedProduct>>> getAffectedProducts(
            @PathVariable String defectCaseId) {
        
        DefectCase defectCase = defectCaseRepository.findByDefectCaseId(defectCaseId)
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        String batchId = defectCase.getBatchNumber() != null ? defectCase.getBatchNumber() : "UNKNOWN";
        List<DefectCaseDto.AffectedProduct> affectedProducts = 
                backtrackingEngineService.identifyAffectedProducts(batchId, "MANUFACTURING");
        
        return ResponseEntity.ok(ApiResponse.success("Affected products identified", affectedProducts));
    }

    @GetMapping("/{defectCaseId}/root-cause")
    public ResponseEntity<ApiResponse<RootCauseAnalysisService.RootCauseAnalysisResult>> analyzeRootCause(
            @PathVariable String defectCaseId) {
        
        DefectCase defectCase = defectCaseRepository.findByDefectCaseId(defectCaseId)
                .orElseThrow(() -> new RuntimeException("Defect case not found"));
        
        String batchId = defectCase.getBatchNumber() != null ? defectCase.getBatchNumber() : "UNKNOWN";
        RootCauseAnalysisService.RootCauseAnalysisResult result = 
                rootCauseAnalysisService.analyzeRootCause(batchId, 
                        defectCase.getOrder() != null ? defectCase.getOrder().getId() : null);
        
        return ResponseEntity.ok(ApiResponse.success("Root cause analysis completed", result));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<DefectCaseDto.Response>>> getDefectsByStatus(
            @PathVariable DefectStatus status) {
        
        List<DefectCase> defectCases = defectCaseRepository.findByStatus(status);
        List<DefectCaseDto.Response> responses = defectCases.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Defect cases retrieved", responses));
    }

    private String generateDefectCaseId() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long sequence = System.currentTimeMillis() % 10000;
        return "DEF-" + timestamp + "-" + String.format("%04d", sequence);
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

    private DefectCaseDto.Response convertToResponse(DefectCase defectCase) {
        return DefectCaseDto.Response.builder()
                .id(defectCase.getId())
                .defectCaseId(defectCase.getDefectCaseId())
                .productQrCode(defectCase.getProductQrCode())
                .productSerialNumber(defectCase.getProductSerialNumber())
                .batchNumber(defectCase.getBatchNumber())
                .orderId(defectCase.getOrder() != null ? defectCase.getOrder().getId() : null)
                .orderNumber(defectCase.getOrder() != null ? defectCase.getOrder().getOrderNumber() : null)
                .productName(defectCase.getOrder() != null ? defectCase.getOrder().getProductName() : null)
                .defectCategory(defectCase.getDefectCategory())
                .severity(defectCase.getSeverity())
                .description(defectCase.getDescription())
                .quantityAffected(defectCase.getQuantityAffected())
                .evidencePhotos(parseJsonList(defectCase.getEvidencePhotos()))
                .evidenceDocuments(parseJsonList(defectCase.getEvidenceDocuments()))
                .location(defectCase.getLocation())
                .reportedByRole(defectCase.getReportedByRole())
                .reportedById(defectCase.getReportedById())
                .reportedByName(defectCase.getReportedByName())
                .organizationId(defectCase.getOrganization().getId())
                .organizationName(defectCase.getOrganization().getName())
                .status(defectCase.getStatus())
                .investigationNotes(defectCase.getInvestigationNotes())
                .rootCause(defectCase.getRootCause())
                .recallRequired(defectCase.getRecallRequired())
                .correctiveActions(defectCase.getCorrectiveActions())
                .contributingFactors(defectCase.getContributingFactors())
                .similarHistoricalCases(parseJsonList(defectCase.getSimilarHistoricalCases()))
                .createdAt(defectCase.getCreatedAt())
                .updatedAt(defectCase.getUpdatedAt())
                .build();
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
}
