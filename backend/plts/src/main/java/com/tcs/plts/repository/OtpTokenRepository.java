package com.tcs.plts.repository;

import com.tcs.plts.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(String identifier, String purpose);
    void deleteByIdentifierAndPurpose(String identifier, String purpose);
}
