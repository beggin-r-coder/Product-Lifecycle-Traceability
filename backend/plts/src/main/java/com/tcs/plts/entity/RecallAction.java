package com.tcs.plts.entity;

import com.tcs.plts.common.enums.RecallActionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recall_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecallAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recall_case_id", nullable = false)
    private RecallCase recallCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stakeholder_id")
    private Stakeholder stakeholder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private String stakeholderName;

    @Column(name = "stakeholder_id_string", nullable = false)
    private String stakeholderIdString;

    @Column(nullable = false)
    private Integer quantityQuarantined;

    @Column(nullable = false)
    private Integer quantityReturned;

    @Column(nullable = false)
    private Integer quantityVerified;

    @Column(nullable = false)
    private Integer quantityDisposed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallActionStatus status;

    @Column(length = 2000)
    private String evidencePhotos; // JSON array of URLs

    @Column(length = 2000)
    private String evidenceDocuments; // JSON array of URLs

    @Column(length = 2000)
    private String remarks;

    private String performedBy;

    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RecallActionStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.status == RecallActionStatus.VERIFIED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }
}
