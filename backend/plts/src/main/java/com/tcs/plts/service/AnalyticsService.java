package com.tcs.plts.service;

import com.tcs.plts.common.enums.OrderStatus;
import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.DashboardAnalyticsDto;
import com.tcs.plts.repository.NotificationRepository;
import com.tcs.plts.repository.OrderRepository;
import com.tcs.plts.repository.StakeholderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StakeholderRepository stakeholderRepository;
    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;

    public DashboardAnalyticsDto getOrganizationAnalytics(Long orgId, Long userId) {
        long totalMfg = stakeholderRepository.countByOrganizationIdAndRole(orgId, Role.MANUFACTURER);
        long totalQa = stakeholderRepository.countByOrganizationIdAndRole(orgId, Role.QA);
        long totalPt = stakeholderRepository.countByOrganizationIdAndRole(orgId, Role.PACKAGING_TRANSPORT);
        long totalRet = stakeholderRepository.countByOrganizationIdAndRole(orgId, Role.RETAILER);

        long totalOrders = orderRepository.countByOrganizationId(orgId);
        long completedOrders = orderRepository.countByOrganizationIdAndStatus(orgId, OrderStatus.COMPLETED);
        long pendingOrders = totalOrders - completedOrders;

        long unreadNotifications = userId != null ? notificationRepository.countByRecipientIdAndIsReadFalse(userId) : 0;

        List<Object[]> stageCounts = orderRepository.countOrdersByStatusForOrg(orgId);
        Map<String, Long> ordersPerStage = new HashMap<>();
        for (Object[] row : stageCounts) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            ordersPerStage.put(status.name(), count);
        }

        return DashboardAnalyticsDto.builder()
                .totalManufacturers(totalMfg)
                .totalQa(totalQa)
                .totalPackaging(totalPt)
                .totalRetailers(totalRet)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .unreadNotifications(unreadNotifications)
                .ordersPerStage(ordersPerStage)
                .build();
    }
}
