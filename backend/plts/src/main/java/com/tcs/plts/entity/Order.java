package com.tcs.plts.entity;

import com.tcs.plts.common.enums.OrderPriority;
import com.tcs.plts.common.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber; // e.g., ORD-20260806-1001

    @Column(nullable = false)
    private String productQrCode;

    @Column(nullable = false)
    private String productName;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer quantity;

    private String productSerialNumber;

    private String manufacturingBatchId;

    private String qaBatchId;

    private String packagingBatchId;

    private String transportBatchId;

    private String rawMaterialBatchId;

    private LocalDate expectedDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderPriority priority;

    @Column(length = 1000)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPremapped = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Stakeholder manufacturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qa_id")
    private Stakeholder qa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packaging_transport_id")
    private Stakeholder packagingTransport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retailer_id")
    private Stakeholder retailer;

    // Shipping & Dispatch details
    private String trackingNumber;
    private String vehicleDetails;
    private LocalDate estimatedDelivery;

    // Report / Document Links
    private String completionNotes;
    private String completionDocumentUrl;
    private String qaRemarks;
    private String qaReportUrl;
    private Boolean qaPassed;

    @Version
    private Long version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LifecycleStage> lifecycleStages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = OrderStatus.CREATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
