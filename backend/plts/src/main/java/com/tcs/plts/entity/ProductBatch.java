package com.tcs.plts.entity;

import com.tcs.plts.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String batchId; // e.g., MFG-452, QA-452, PKG-452, TRN-452

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private String batchType; // MANUFACTURING, QA, PACKAGING, TRANSPORT, RAW_MATERIAL

    private String parentBatchId; // Links to previous stage batch

    @Column(length = 2000)
    private String previousStage; // Previous stage information

    @Column(length = 2000)
    private String nextStage; // Next stage information

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stakeholder_id")
    private Stakeholder stakeholder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(nullable = false)
    private String stakeholderName;

    @Enumerated(EnumType.STRING)
    private Role stakeholderRole;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 2000)
    private String documents; // JSON array of document URLs

    @Column(length = 2000)
    private String certificates; // JSON array of certificate URLs

    @Column(length = 2000)
    private String photos; // JSON array of photo URLs

    private String machineId;

    private String productionLine;

    private String shift;

    private String operator;

    private String rawMaterialLot;

    private String transportRoute;

    @Column(length = 2000)
    private String remarks;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
