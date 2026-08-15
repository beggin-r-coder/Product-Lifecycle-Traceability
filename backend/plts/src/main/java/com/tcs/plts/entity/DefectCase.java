package com.tcs.plts.entity;

import com.tcs.plts.common.enums.DefectCategory;
import com.tcs.plts.common.enums.DefectSeverity;
import com.tcs.plts.common.enums.DefectStatus;
import com.tcs.plts.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "defect_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefectCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String defectCaseId; // e.g., DEF-20260812-0001

    @Column(nullable = false)
    private String productQrCode;

    @Column(nullable = false)
    private String productSerialNumber;

    private String batchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefectCategory defectCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefectSeverity severity;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer quantityAffected;

    @Column(length = 2000)
    private String evidencePhotos; // JSON array of URLs

    @Column(length = 2000)
    private String evidenceDocuments; // JSON array of URLs

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role reportedByRole;

    @Column(nullable = false)
    private String reportedById;

    @Column(nullable = false)
    private String reportedByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefectStatus status;

    @Column(length = 5000)
    private String investigationNotes;

    @Column(length = 2000)
    private String rootCause;

    @Column(nullable = false)
    @Builder.Default
    private Boolean recallRequired = false;

    @Column(length = 2000)
    private String correctiveActions;

    @Column(length = 2000)
    private String contributingFactors; // JSON array

    @Column(length = 2000)
    private String similarHistoricalCases; // JSON array of defect case IDs

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DefectStatus.DEFECT_REPORTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
