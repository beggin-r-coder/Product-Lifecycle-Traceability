package com.tcs.plts.dto;

import com.tcs.plts.common.enums.DefectCategory;
import com.tcs.plts.common.enums.DefectSeverity;
import com.tcs.plts.common.enums.DefectStatus;
import com.tcs.plts.common.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class DefectCaseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Product QR code is required")
        private String productQrCode;

        @NotBlank(message = "Product serial number is required")
        private String productSerialNumber;

        private String batchNumber;

        private Long orderId;

        @NotNull(message = "Defect category is required")
        private DefectCategory defectCategory;

        @NotNull(message = "Severity is required")
        private DefectSeverity severity;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Quantity affected is required")
        private Integer quantityAffected;

        private List<String> evidencePhotos;

        private List<String> evidenceDocuments;

        private String location;

        @NotNull(message = "Reported by role is required")
        private Role reportedByRole;

        @NotNull(message = "Reported by ID is required")
        private String reportedById;

        @NotBlank(message = "Reported by name is required")
        private String reportedByName;

        @NotNull(message = "Organization ID is required")
        private Long organizationId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateInvestigationRequest {
        private DefectStatus status;

        private String investigationNotes;

        private String rootCause;

        private Boolean recallRequired;

        private String correctiveActions;

        private String contributingFactors;

        private List<String> similarHistoricalCases;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String defectCaseId;
        private String productQrCode;
        private String productSerialNumber;
        private String batchNumber;
        private Long orderId;
        private String orderNumber;
        private String productName;
        private DefectCategory defectCategory;
        private DefectSeverity severity;
        private String description;
        private Integer quantityAffected;
        private List<String> evidencePhotos;
        private List<String> evidenceDocuments;
        private String location;
        private Role reportedByRole;
        private String reportedById;
        private String reportedByName;
        private Long organizationId;
        private String organizationName;
        private DefectStatus status;
        private String investigationNotes;
        private String rootCause;
        private Boolean recallRequired;
        private String correctiveActions;
        private String contributingFactors;
        private List<String> similarHistoricalCases;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BacktrackingTimeline {
        private String stage;
        private String stakeholderName;
        private String stakeholderId;
        private String batchNumber;
        private LocalDateTime timestamp;
        private String responsiblePerson;
        private List<String> documents;
        private List<String> certificates;
        private List<String> photos;
        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AffectedProduct {
        private String productId;
        private String serialNumber;
        private String batchNumber;
        private String riskLevel;
        private String riskReason;
        private String currentLocation;
        private String status;
    }
}
