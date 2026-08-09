package com.tcs.plts.dto;

import com.tcs.plts.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicTraceabilityDto {
    private String orderNumber;
    private String productName;
    private String description;
    private Integer quantity;
    private OrderStatus status;
    private String currentStageTitle;
    private String organizationName;

    private String manufacturerName;
    private String qaName;
    private String packagingTransportName;
    private String retailerName;

    private String trackingNumber;
    private String vehicleDetails;
    private LocalDate estimatedDelivery;

    private String qaRemarks;
    private Boolean qaPassed;

    private LocalDateTime completionDate;

    private List<LifecycleStageDto.Response> timeline;
}
