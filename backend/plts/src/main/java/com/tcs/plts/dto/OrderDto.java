package com.tcs.plts.dto;

import com.tcs.plts.common.enums.OrderPriority;
import com.tcs.plts.common.enums.OrderStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Product name is required")
        private String productName;

        private String description;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @FutureOrPresent(message = "Expected delivery date must be today or in the future")
        private LocalDate expectedDeliveryDate;

        @NotNull(message = "Priority is required")
        private OrderPriority priority;

        private String remarks;
    }

    @Data
    public static class AssignStakeholderRequest {
        @NotNull(message = "Stakeholder ID is required")
        private Long stakeholderId;
        private String remarks;
    }

    @Data
    public static class UpdateManufacturerProgressRequest {
        private String notes;
        private String documentUrl;
    }

    @Data
    public static class UpdateQaReportRequest {
        @NotBlank(message = "Inspection remarks are required")
        private String qaRemarks;
        private String qaReportUrl;
        @NotNull(message = "Inspection outcome (passed: true/false) is required")
        private Boolean passed;
    }

    @Data
    public static class UpdateShippingDetailsRequest {
        @NotBlank(message = "Tracking number is required")
        private String trackingNumber;
        @NotBlank(message = "Vehicle details are required")
        private String vehicleDetails;
        private LocalDate estimatedDelivery;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private String orderNumber;
        private String productName;
        private String description;
        private Integer quantity;
        private LocalDate expectedDeliveryDate;
        private OrderPriority priority;
        private String remarks;
        private OrderStatus status;

        private String organizationName;
        private Long organizationId;

        private StakeholderDto.Response manufacturer;
        private StakeholderDto.Response qa;
        private StakeholderDto.Response packagingTransport;
        private StakeholderDto.Response retailer;

        private String trackingNumber;
        private String vehicleDetails;
        private LocalDate estimatedDelivery;

        private String completionNotes;
        private String completionDocumentUrl;
        private String qaRemarks;
        private String qaReportUrl;
        private Boolean qaPassed;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private List<LifecycleStageDto.Response> lifecycleStages;
    }
}
