package com.tcs.plts.repository;

import com.tcs.plts.common.enums.RecallStatus;
import com.tcs.plts.entity.RecallCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecallCaseRepository extends JpaRepository<RecallCase, Long> {

    Optional<RecallCase> findByRecallId(String recallId);

    List<RecallCase> findByDefectCaseId(Long defectCaseId);

    @Query("SELECT r FROM RecallCase r WHERE r.defectCase.organization.id = :orgId ORDER BY r.createdAt DESC")
    List<RecallCase> findByOrganizationIdOrderByCreatedAtDesc(@Param("orgId") Long orgId);

    List<RecallCase> findByStatus(RecallStatus status);

    List<RecallCase> findByStatusIn(List<RecallStatus> statuses);

    @Query("SELECT r FROM RecallCase r WHERE r.status IN :statuses ORDER BY r.createdAt DESC")
    List<RecallCase> findByStatusInOrderByCreatedAtDesc(@Param("statuses") List<RecallStatus> statuses);

    @Query("SELECT COUNT(r) FROM RecallCase r WHERE r.defectCase.organization.id = :orgId AND r.status = :status")
    long countByOrganizationIdAndStatus(@Param("orgId") Long orgId, @Param("status") RecallStatus status);
}
