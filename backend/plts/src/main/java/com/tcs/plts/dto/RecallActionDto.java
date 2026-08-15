package com.tcs.plts.dto;

import com.tcs.plts.common.enums.RecallActionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class RecallActionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Recall case ID is required")
        private Long recallCaseId;

        private Long stakeholderId;

        private Long orderId;

        @NotNull(message = "Stakeholder name is required")
        private String stakeholderName;

        @NotNull(message = "Stakeholder ID string is required")
        private String stakeholderIdString;

        private Integer quantityQuarantined;

        private Integer quantityReturned;

        private Integer quantityVerified;

        private Integer quantityDisposed;

        private RecallActionStatus status;

        private List<String> evidencePhotos;

        private List<String> evidenceDocuments;

        private String remarks;

        private String performedBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Integer quantityQuarantined;

        private Integer quantityReturned;

        private Integer quantityVerified;

        private Integer quantityDisposed;

        private RecallActionStatus status;

        private List<String> evidencePhotos;

        private List<String> evidenceDocuments;

        private String remarks;

        private String performedBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long recallCaseId;
        private String recallId;
        private Long stakeholderId;
        private Long orderId;
        private String orderNumber;
        private String stakeholderName;
        private String stakeholderIdString;
        private Integer quantityQuarantined;
        private Integer quantityReturned;
        private Integer quantityVerified;
        private Integer quantityDisposed;
        private RecallActionStatus status;
        private List<String> evidencePhotos;
        private List<String> evidenceDocuments;
        private String remarks;
        private String performedBy;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
