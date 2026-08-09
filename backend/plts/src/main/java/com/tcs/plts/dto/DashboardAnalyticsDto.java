package com.tcs.plts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardAnalyticsDto {
    private long totalManufacturers;
    private long totalQa;
    private long totalPackaging;
    private long totalRetailers;
    private long totalOrders;
    private long completedOrders;
    private long pendingOrders;
    private long unreadNotifications;
    private Map<String, Long> ordersPerStage;
}
