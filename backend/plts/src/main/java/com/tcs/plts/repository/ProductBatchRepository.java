package com.tcs.plts.repository;

import com.tcs.plts.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    Optional<ProductBatch> findByBatchId(String batchId);

    List<ProductBatch> findByOrderId(Long orderId);

    List<ProductBatch> findByBatchType(String batchType);

    List<ProductBatch> findByParentBatchId(String parentBatchId);

    List<ProductBatch> findByStakeholderId(Long stakeholderId);

    List<ProductBatch> findByOrganizationId(Long organizationId);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.order.id = :orderId ORDER BY pb.timestamp ASC")
    List<ProductBatch> findByOrderIdOrderByTimestampAsc(@Param("orderId") Long orderId);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.batchId LIKE :batchPrefix% ORDER BY pb.timestamp DESC")
    List<ProductBatch> findByBatchIdStartingWith(@Param("batchPrefix") String batchPrefix);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.rawMaterialLot = :rawMaterialLot")
    List<ProductBatch> findByRawMaterialLot(@Param("rawMaterialLot") String rawMaterialLot);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.productionLine = :productionLine")
    List<ProductBatch> findByProductionLine(@Param("productionLine") String productionLine);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.machineId = :machineId")
    List<ProductBatch> findByMachineId(@Param("machineId") String machineId);
}
