package com.tcs.plts.repository;

import com.tcs.plts.common.enums.Role;
import com.tcs.plts.entity.Stakeholder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StakeholderRepository extends JpaRepository<Stakeholder, Long> {
    Optional<Stakeholder> findByGeneratedUserId(String generatedUserId);
    Optional<Stakeholder> findByUserId(Long userId);
    List<Stakeholder> findByOrganizationId(Long organizationId);
    List<Stakeholder> findByOrganizationIdAndRole(Long organizationId, Role role);
    Optional<Stakeholder> findByCompanyEmail(String companyEmail);
    long countByOrganizationIdAndRole(Long organizationId, Role role);
    long countByOrganizationId(Long organizationId);

    @Query("SELECT COUNT(s) FROM Stakeholder s WHERE s.role = :role")
    long countByRole(@Param("role") Role role);

    @Query("SELECT MAX(s.id) FROM Stakeholder s WHERE s.role = :role")
    Long getMaxIdByRole(@Param("role") Role role);
}
