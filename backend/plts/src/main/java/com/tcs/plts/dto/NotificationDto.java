package com.tcs.plts.dto;

import com.tcs.plts.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String message;
        private NotificationType type;
        private boolean isRead;
        private String orderId;
        private LocalDateTime createdAt;
    }
}
