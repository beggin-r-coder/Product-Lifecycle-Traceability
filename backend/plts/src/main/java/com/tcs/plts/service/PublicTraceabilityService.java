package com.tcs.plts.service;

import com.tcs.plts.dto.OrderDto;
import com.tcs.plts.dto.PublicTraceabilityDto;
import com.tcs.plts.entity.Order;
import com.tcs.plts.entity.DefectCase;
import com.tcs.plts.entity.RecallCase;
import com.tcs.plts.repository.OrderRepository;
import com.tcs.plts.repository.DefectCaseRepository;
import com.tcs.plts.repository.RecallCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PublicTraceabilityService {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final DefectCaseRepository defectCaseRepository;
    private final RecallCaseRepository recallCaseRepository;

    public PublicTraceabilityDto getPublicTraceability(String orderNumber) {
        OrderDto.Response order = orderService.getOrderByOrderNumber(orderNumber);

        String currentStageTitle = switch (order.getStatus()) {
            case CREATED -> "Order Registered";
            case MANUFACTURER_ASSIGNED -> "Assigned to Manufacturer";
            case MANUFACTURING -> "Manufacturing In Progress";
            case MANUFACTURING_COMPLETED -> "Manufacturing Completed";
            case QA_ASSIGNED -> "Assigned to Quality Assurance";
            case QA_IN_PROGRESS -> "QA Inspection In Progress";
            case QA_COMPLETED -> "QA Passed & Certified";
            case PACKAGING_ASSIGNED -> "Assigned to Packaging";
            case PACKAGING_IN_PROGRESS -> "Packaging In Progress";
            case PACKAGING_COMPLETED -> "Packaged & Dispatched";
            case TRANSPORT_COMPLETED -> "Transport Completed";
            case RETAILER_ASSIGNED -> "Assigned to Retailer";
            case DELIVERED -> "Delivered to Retailer";
            case COMPLETED -> "Lifecycle Completed & Product Available";
            case REJECTED -> "Order Rejected / Failed Inspection";
        };

        return PublicTraceabilityDto.builder()
                .orderNumber(order.getOrderNumber())
                .productName(order.getProductName())
                .description(order.getDescription())
                .quantity(order.getQuantity())
                .status(order.getStatus())
                .currentStageTitle(currentStageTitle)
                .organizationName(order.getOrganizationName())
                .manufacturerName(order.getManufacturer() != null ? order.getManufacturer().getCompanyName() : "Pending Assignment")
                .qaName(order.getQa() != null ? order.getQa().getCompanyName() : "Pending Assignment")
                .packagingTransportName(order.getPackagingTransport() != null ? order.getPackagingTransport().getCompanyName() : "Pending Assignment")
                .retailerName(order.getRetailer() != null ? order.getRetailer().getCompanyName() : "Pending Assignment")
                .trackingNumber(order.getTrackingNumber())
                .vehicleDetails(order.getVehicleDetails())
                .estimatedDelivery(order.getEstimatedDelivery())
                .qaRemarks(order.getQaRemarks())
                .qaPassed(order.getQaPassed())
                .completionDate(order.getUpdatedAt())
                .timeline(order.getLifecycleStages())
                .build();
    }

    public Map<String, Object> verifyQrCode(String qrCode) {
        Map<String, Object> result = new HashMap<>();
        
        // Find order by QR code
        Order order = orderRepository.findByProductQrCode(qrCode).orElse(null);
        
        if (order == null) {
            result.put("valid", false);
            result.put("message", "QR code not found in system");
            return result;
        }
        
        // Check for active recalls (multiple statuses indicate active recall)
        List<com.tcs.plts.common.enums.RecallStatus> activeStatuses = List.of(
            com.tcs.plts.common.enums.RecallStatus.APPROVED,
            com.tcs.plts.common.enums.RecallStatus.NOTIFICATIONS_SENT,
            com.tcs.plts.common.enums.RecallStatus.COLLECTION_IN_PROGRESS,
            com.tcs.plts.common.enums.RecallStatus.VERIFICATION_IN_PROGRESS
        );
        
        List<RecallCase> activeRecalls = recallCaseRepository.findByStatusIn(activeStatuses);
        
        boolean isRecalled = activeRecalls.stream()
            .anyMatch(recall -> {
                List<String> affectedBatches = parseJsonList(recall.getAffectedBatches());
                return affectedBatches.contains(order.getManufacturingBatchId()) ||
                       affectedBatches.contains(order.getQaBatchId()) ||
                       affectedBatches.contains(order.getPackagingBatchId());
            });
        
        // Check for defect cases
        java.util.Optional<DefectCase> defectCaseOpt = defectCaseRepository.findByProductSerialNumber(
            order.getProductSerialNumber()
        );
        
        boolean hasDefect = defectCaseOpt.isPresent();
        
        result.put("valid", true);
        result.put("orderNumber", order.getOrderNumber());
        result.put("productName", order.getProductName());
        result.put("serialNumber", order.getProductSerialNumber());
        result.put("batchNumber", order.getManufacturingBatchId());
        result.put("status", order.getStatus());
        result.put("isRecalled", isRecalled);
        result.put("hasDefect", hasDefect);
        result.put("manufacturer", order.getManufacturer() != null ? order.getManufacturer().getCompanyName() : "Unknown");
        result.put("organization", order.getOrganization() != null ? order.getOrganization().getName() : "Unknown");
        
        if (isRecalled) {
            result.put("recallMessage", "This product is subject to an active recall. Please contact the manufacturer or retailer for instructions.");
        }
        
        if (hasDefect) {
            result.put("defectMessage", "This product has been reported with defects. Please review the defect details.");
        }
        
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) {
            return List.of();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }
}
