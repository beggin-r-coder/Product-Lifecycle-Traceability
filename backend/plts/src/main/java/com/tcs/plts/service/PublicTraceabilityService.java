package com.tcs.plts.service;

import com.tcs.plts.dto.OrderDto;
import com.tcs.plts.dto.PublicTraceabilityDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicTraceabilityService {

    private final OrderService orderService;

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
}
