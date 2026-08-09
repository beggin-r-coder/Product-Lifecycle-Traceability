package com.tcs.plts.repository;

import com.tcs.plts.entity.LifecycleStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LifecycleStageRepository extends JpaRepository<LifecycleStage, Long> {
    List<LifecycleStage> findByOrderIdOrderByTimestampAsc(Long orderId);
    List<LifecycleStage> findByOrderOrderNumberOrderByTimestampAsc(String orderNumber);
}
