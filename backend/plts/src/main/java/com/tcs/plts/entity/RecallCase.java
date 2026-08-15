package com.tcs.plts.entity;

import com.tcs.plts.common.enums.RecallScope;
import com.tcs.plts.common.enums.RecallStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recall_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecallCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String recallId; // e.g., REC-20260812-0001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "defect_case_id", nullable = false)
    private DefectCase defectCase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallScope recallScope;

    @Column(nullable = false)
    private Integer affectedProductCount;

    @Column(length = 2000)
    private String affectedBatches; // JSON array of batch IDs

    @Column(nullable = false)
    private String initiatedBy;

    @Column(nullable = false)
    private String initiatedByName;

    @Column(nullable = false)
    private String approvedBy;

    @Column(nullable = false)
    private String approvedByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallStatus status;

    @Column(length = 2000)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(length = 5000)
    private String recallReason;

    @Column(length = 2000)
    private String affectedRetailers; // JSON array of retailer IDs

    @Column(length = 2000)
    private String affectedTransportPartners; // JSON array of transport partner IDs

    private Long estimatedCost;

    private LocalDateTime estimatedCompletionDate;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RecallStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.status == RecallStatus.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }
}
