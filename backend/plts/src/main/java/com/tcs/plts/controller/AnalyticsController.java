package com.tcs.plts.controller;

import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.DashboardAnalyticsDto;
import com.tcs.plts.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/org/{orgId}")
    public ResponseEntity<ApiResponse<DashboardAnalyticsDto>> getAnalytics(
            @PathVariable Long orgId,
            @RequestParam(required = false) Long userId) {
        DashboardAnalyticsDto analytics = analyticsService.getOrganizationAnalytics(orgId, userId);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }
}
