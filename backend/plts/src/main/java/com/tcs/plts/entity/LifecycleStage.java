package com.tcs.plts.entity;

import com.tcs.plts.common.enums.OrderStatus;
import com.tcs.plts.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lifecycle_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LifecycleStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus stageStatus;

    @Column(nullable = false)
    private String stageTitle;

    private String responsibleCompanyName;

    @Enumerated(EnumType.STRING)
    private Role responsibleRole;

    @Column(length = 2000)
    private String remarks;

    private String attachmentUrl;

    private String performedByUserId;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
