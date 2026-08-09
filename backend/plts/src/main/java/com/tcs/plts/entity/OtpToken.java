package com.tcs.plts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String identifier; // Email or Generated User ID (e.g., MAN-000001)

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String purpose; // ORG_REGISTRATION, STAKEHOLDER_LOGIN

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    private boolean used = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
