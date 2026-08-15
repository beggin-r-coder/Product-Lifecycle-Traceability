package com.tcs.plts.service;

import com.tcs.plts.entity.DefectCase;
import com.tcs.plts.entity.RecallCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecallNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyDefectReported(DefectCase defectCase) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "DEFECT_REPORTED");
        notification.put("defectCaseId", defectCase.getDefectCaseId());
        notification.put("severity", defectCase.getSeverity());
        notification.put("category", defectCase.getDefectCategory());
        notification.put("organizationId", defectCase.getOrganization().getId());
        notification.put("message", String.format("New defect reported: %s - %s", 
                defectCase.getDefectCategory(), defectCase.getSeverity()));
        notification.put("timestamp", defectCase.getCreatedAt());

        messagingTemplate.convertAndSend("/topic/organization/" + defectCase.getOrganization().getId(), notification);
        log.info("Defect reported notification sent for defect case: {}", defectCase.getDefectCaseId());
    }

    public void notifyRecallInitiated(RecallCase recallCase) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "RECALL_INITIATED");
        notification.put("recallId", recallCase.getRecallId());
        notification.put("recallScope", recallCase.getRecallScope());
        notification.put("affectedProductCount", recallCase.getAffectedProductCount());
        notification.put("organizationId", recallCase.getDefectCase().getOrganization().getId());
        notification.put("message", String.format("Recall initiated: %s - %d products affected", 
                recallCase.getRecallId(), recallCase.getAffectedProductCount()));
        notification.put("timestamp", recallCase.getCreatedAt());

        messagingTemplate.convertAndSend("/topic/organization/" + recallCase.getDefectCase().getOrganization().getId(), notification);
        messagingTemplate.convertAndSend("/topic/recall/" + recallCase.getRecallId(), notification);
        log.info("Recall initiated notification sent for recall: {}", recallCase.getRecallId());
    }

    public void notifyRecallApproved(RecallCase recallCase) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "RECALL_APPROVED");
        notification.put("recallId", recallCase.getRecallId());
        notification.put("approvedBy", recallCase.getApprovedByName());
        notification.put("organizationId", recallCase.getDefectCase().getOrganization().getId());
        notification.put("message", String.format("Recall approved: %s by %s", 
                recallCase.getRecallId(), recallCase.getApprovedByName()));
        notification.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/organization/" + recallCase.getDefectCase().getOrganization().getId(), notification);
        messagingTemplate.convertAndSend("/topic/recall/" + recallCase.getRecallId(), notification);
        log.info("Recall approved notification sent for recall: {}", recallCase.getRecallId());
    }

    public void notifyInvestigationUpdate(DefectCase defectCase) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "INVESTIGATION_UPDATE");
        notification.put("defectCaseId", defectCase.getDefectCaseId());
        notification.put("status", defectCase.getStatus());
        notification.put("organizationId", defectCase.getOrganization().getId());
        notification.put("message", String.format("Investigation updated: %s - Status: %s", 
                defectCase.getDefectCaseId(), defectCase.getStatus()));
        notification.put("timestamp", defectCase.getUpdatedAt());

        messagingTemplate.convertAndSend("/topic/organization/" + defectCase.getOrganization().getId(), notification);
        log.info("Investigation update notification sent for defect case: {}", defectCase.getDefectCaseId());
    }

    public void notifyRootCauseIdentified(DefectCase defectCase, String rootCause) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "ROOT_CAUSE_IDENTIFIED");
        notification.put("defectCaseId", defectCase.getDefectCaseId());
        notification.put("rootCause", rootCause);
        notification.put("organizationId", defectCase.getOrganization().getId());
        notification.put("message", String.format("Root cause identified: %s - %s", 
                defectCase.getDefectCaseId(), rootCause));
        notification.put("timestamp", defectCase.getUpdatedAt());

        messagingTemplate.convertAndSend("/topic/organization/" + defectCase.getOrganization().getId(), notification);
        log.info("Root cause identified notification sent for defect case: {}", defectCase.getDefectCaseId());
    }

    public void sendRecallProgressUpdate(RecallCase recallCase, String progressMessage) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "RECALL_PROGRESS");
        notification.put("recallId", recallCase.getRecallId());
        notification.put("status", recallCase.getStatus());
        notification.put("message", progressMessage);
        notification.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/recall/" + recallCase.getRecallId(), notification);
        log.info("Recall progress update sent for recall: {}", recallCase.getRecallId());
    }
}
