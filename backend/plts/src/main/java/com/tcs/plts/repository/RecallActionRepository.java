package com.tcs.plts.repository;

import com.tcs.plts.common.enums.RecallActionStatus;
import com.tcs.plts.entity.RecallAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecallActionRepository extends JpaRepository<RecallAction, Long> {

    List<RecallAction> findByRecallCaseId(Long recallCaseId);

    List<RecallAction> findByStakeholderId(Long stakeholderId);

    List<RecallAction> findByOrderId(Long orderId);

    List<RecallAction> findByStatus(RecallActionStatus status);

    @Query("SELECT ra FROM RecallAction ra WHERE ra.recallCase.id = :recallCaseId AND ra.stakeholder.id = :stakeholderId")
    List<RecallAction> findByRecallCaseIdAndStakeholderId(@Param("recallCaseId") Long recallCaseId, @Param("stakeholderId") Long stakeholderId);

    @Query("SELECT SUM(ra.quantityQuarantined) FROM RecallAction ra WHERE ra.recallCase.id = :recallCaseId")
    Integer sumQuarantinedByRecallCaseId(@Param("recallCaseId") Long recallCaseId);

    @Query("SELECT SUM(ra.quantityReturned) FROM RecallAction ra WHERE ra.recallCase.id = :recallCaseId")
    Integer sumReturnedByRecallCaseId(@Param("recallCaseId") Long recallCaseId);

    @Query("SELECT SUM(ra.quantityVerified) FROM RecallAction ra WHERE ra.recallCase.id = :recallCaseId")
    Integer sumVerifiedByRecallCaseId(@Param("recallCaseId") Long recallCaseId);

    @Query("SELECT COUNT(ra) FROM RecallAction ra WHERE ra.recallCase.id = :recallCaseId AND ra.status = :status")
    long countByRecallCaseIdAndStatus(@Param("recallCaseId") Long recallCaseId, @Param("status") RecallActionStatus status);
}
