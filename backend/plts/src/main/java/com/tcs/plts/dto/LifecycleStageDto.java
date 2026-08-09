package com.tcs.plts.dto;

import com.tcs.plts.common.enums.OrderStatus;
import com.tcs.plts.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class LifecycleStageDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private OrderStatus stageStatus;
        private String stageTitle;
        private String responsibleCompanyName;
        private Role responsibleRole;
        private String remarks;
        private String attachmentUrl;
        private String performedByUserId;
        private LocalDateTime timestamp;
    }
}
