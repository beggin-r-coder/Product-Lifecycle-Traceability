package com.tcs.plts.repository;

import com.tcs.plts.common.enums.DefectStatus;
import com.tcs.plts.common.enums.Role;
import com.tcs.plts.entity.DefectCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DefectCaseRepository extends JpaRepository<DefectCase, Long> {

    Optional<DefectCase> findByDefectCaseId(String defectCaseId);

    Optional<DefectCase> findByProductSerialNumber(String productSerialNumber);

    List<DefectCase> findByOrganizationId(Long organizationId);

    List<DefectCase> findByOrganizationIdAndStatus(Long organizationId, DefectStatus status);

    @Query("SELECT d FROM DefectCase d WHERE d.reportedByRole = :role AND d.reportedById = :reportedById")
    List<DefectCase> findByReportedByRoleAndReportedById(@Param("role") Role role, @Param("reportedById") String reportedById);

    List<DefectCase> findByBatchNumber(String batchNumber);

    @Query("SELECT d FROM DefectCase d WHERE d.organization.id = :orgId ORDER BY d.createdAt DESC")
    List<DefectCase> findByOrganizationIdOrderByCreatedAtDesc(@Param("orgId") Long orgId);

    List<DefectCase> findByStatus(DefectStatus status);

    @Query("SELECT d FROM DefectCase d WHERE d.status IN :statuses ORDER BY d.createdAt DESC")
    List<DefectCase> findByStatusInOrderByCreatedAtDesc(@Param("statuses") List<DefectStatus> statuses);

    @Query("SELECT COUNT(d) FROM DefectCase d WHERE d.organization.id = :orgId AND d.status = :status")
    long countByOrganizationIdAndStatus(@Param("orgId") Long orgId, @Param("status") DefectStatus status);

    @Query("SELECT d FROM DefectCase d WHERE d.severity = :severity ORDER BY d.createdAt DESC")
    List<DefectCase> findBySeverityOrderByCreatedAtDesc(@Param("severity") com.tcs.plts.common.enums.DefectSeverity severity);
}
