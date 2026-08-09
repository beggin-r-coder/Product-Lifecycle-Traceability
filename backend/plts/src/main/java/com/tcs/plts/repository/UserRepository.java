package com.tcs.plts.repository;

import com.tcs.plts.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGeneratedUserId(String generatedUserId);
    boolean existsByEmail(String email);
    boolean existsByGeneratedUserId(String generatedUserId);
}
