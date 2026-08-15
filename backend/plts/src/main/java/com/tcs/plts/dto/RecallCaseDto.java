package com.tcs.plts.dto;

import com.tcs.plts.common.enums.RecallScope;
import com.tcs.plts.common.enums.RecallStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class RecallCaseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Defect case ID is required")
        private Long defectCaseId;

        @NotNull(message = "Recall scope is required")
        private RecallScope recallScope;

        @NotNull(message = "Affected product count is required")
        private Integer affectedProductCount;

        private List<String> affectedBatches;

        @NotBlank(message = "Initiated by is required")
        private String initiatedBy;

        @NotBlank(message = "Initiated by name is required")
        private String initiatedByName;

        @NotBlank(message = "Approved by is required")
        private String approvedBy;

        @NotBlank(message = "Approved by name is required")
        private String approvedByName;

        private String priority;

        private String recallReason;

        private List<String> affectedRetailers;

        private List<String> affectedTransportPartners;

        private Long estimatedCost;

        private LocalDateTime estimatedCompletionDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private RecallStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String recallId;
        private Long defectCaseId;
        private String defectCaseIdString;
        private RecallScope recallScope;
        private Integer affectedProductCount;
        private List<String> affectedBatches;
        private String initiatedBy;
        private String initiatedByName;
        private String approvedBy;
        private String approvedByName;
        private RecallStatus status;
        private String priority;
        private String recallReason;
        private List<String> affectedRetailers;
        private List<String> affectedTransportPartners;
        private Long estimatedCost;
        private LocalDateTime estimatedCompletionDate;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecallImpactReport {
        private String recallId;
        private String affectedBatch;
        private Integer totalProduced;
        private Integer unitsPassedQa;
        private Integer unitsPackaged;
        private Integer unitsTransported;
        private Integer unitsDelivered;
        private Integer unitsSold;
        private Integer unitsInWarehouses;
        private Integer unitsWithRetailers;
        private Integer unitsInTransit;
        private Integer unitsAlreadyRecalled;
        private Double recallCoverage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecallMetrics {
        private Long totalRecalls;
        private Long activeRecalls;
        private Long completedRecalls;
        private Integer totalProductsRecalled;
        private Integer productsPending;
        private Long retailersCompleted;
        private Long transportCompleted;
        private Long manufacturerVerified;
        private Long qaVerified;
        private Double completionPercentage;
    }
}
