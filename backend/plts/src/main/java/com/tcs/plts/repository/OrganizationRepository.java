package com.tcs.plts.repository;

import com.tcs.plts.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByEmail(String email);
    Optional<Organization> findByUserId(Long userId); // maps to user.id via @JoinColumn user_id
    boolean existsByEmail(String email);
    boolean existsByCompanyRegistrationNumber(String companyRegistrationNumber);
}
