package com.tcs.plts.dto;

import com.tcs.plts.common.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ProductBatchDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Batch ID is required")
        private String batchId;

        private Long orderId;

        @NotBlank(message = "Batch type is required")
        private String batchType;

        private String parentBatchId;

        private String previousStage;

        private String nextStage;

        private Long stakeholderId;

        private Long organizationId;

        @NotBlank(message = "Stakeholder name is required")
        private String stakeholderName;

        private Role stakeholderRole;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private List<String> documents;

        private List<String> certificates;

        private List<String> photos;

        private String machineId;

        private String productionLine;

        private String shift;

        private String operator;

        private String rawMaterialLot;

        private String transportRoute;

        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String batchId;
        private Long orderId;
        private String orderNumber;
        private String batchType;
        private String parentBatchId;
        private String previousStage;
        private String nextStage;
        private Long stakeholderId;
        private Long organizationId;
        private String stakeholderName;
        private Role stakeholderRole;
        private Integer quantity;
        private List<String> documents;
        private List<String> certificates;
        private List<String> photos;
        private String machineId;
        private String productionLine;
        private String shift;
        private String operator;
        private String rawMaterialLot;
        private String transportRoute;
        private String remarks;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BacktrackingNode {
        private String stage;
        private String batchId;
        private String stakeholderName;
        private String stakeholderId;
        private String company;
        private LocalDateTime timestamp;
        private String responsiblePerson;
        private List<String> documents;
        private List<String> certificates;
        private List<String> photos;
        private String machineId;
        private String productionLine;
        private String shift;
        private String operator;
        private String rawMaterialLot;
    }
}
