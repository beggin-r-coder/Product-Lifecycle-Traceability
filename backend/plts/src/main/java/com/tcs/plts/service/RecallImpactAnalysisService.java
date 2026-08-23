package com.tcs.plts.service;

import com.tcs.plts.dto.RecallCaseDto;
import com.tcs.plts.entity.ProductBatch;
import com.tcs.plts.entity.RecallCase;
import com.tcs.plts.repository.ProductBatchRepository;
import com.tcs.plts.repository.RecallActionRepository;
import com.tcs.plts.repository.RecallCaseRepository;
import com.tcs.plts.common.enums.RecallStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecallImpactAnalysisService {

    private final ProductBatchRepository productBatchRepository;
    private final RecallActionRepository recallActionRepository;
    private final RecallCaseRepository recallCaseRepository;

    public RecallCaseDto.RecallImpactReport generateRecallImpactReport(String batchId, Long recallCaseId) {
        RecallCaseDto.RecallImpactReport report = RecallCaseDto.RecallImpactReport.builder()
                .recallId("REC-" + System.currentTimeMillis())
                .affectedBatch(batchId)
                .build();

        ProductBatch manufacturingBatch = productBatchRepository.findByBatchId(batchId).orElse(null);
        if (manufacturingBatch != null) {
            report.setTotalProduced(manufacturingBatch.getQuantity());
        }

        List<ProductBatch> allBatches = productBatchRepository.findByParentBatchId(batchId);
        
        int unitsPassedQa = 0;
        int unitsPackaged = 0;
        int unitsTransported = 0;
        int unitsDelivered = 0;
        int unitsSold = 0;

        for (ProductBatch batch : allBatches) {
            switch (batch.getBatchType()) {
                case "QA":
                    unitsPassedQa += batch.getQuantity();
                    break;
                case "PACKAGING":
                    unitsPackaged += batch.getQuantity();
                    break;
                case "TRANSPORT":
                    unitsTransported += batch.getQuantity();
                    break;
                case "RETAILER":
                    unitsDelivered += batch.getQuantity();
                    unitsSold += batch.getQuantity();
                    break;
            }
        }

        report.setUnitsPassedQa(unitsPassedQa);
        report.setUnitsPackaged(unitsPackaged);
        report.setUnitsTransported(unitsTransported);
        report.setUnitsDelivered(unitsDelivered);
        report.setUnitsSold(unitsSold);

        if (recallCaseId != null) {
            Integer quarantined = recallActionRepository.sumQuarantinedByRecallCaseId(recallCaseId);
            report.setUnitsAlreadyRecalled(quarantined != null ? quarantined : 0);
        }

        int totalProduced = report.getTotalProduced() != null ? report.getTotalProduced() : 0;
        int unitsInWarehouses = unitsPackaged - unitsTransported;
        int unitsWithRetailers = unitsDelivered - (report.getUnitsAlreadyRecalled() != null ? report.getUnitsAlreadyRecalled() : 0);
        int unitsInTransit = unitsTransported - unitsDelivered;

        report.setUnitsInWarehouses(Math.max(0, unitsInWarehouses));
        report.setUnitsWithRetailers(Math.max(0, unitsWithRetailers));
        report.setUnitsInTransit(Math.max(0, unitsInTransit));

        double recallCoverage = totalProduced > 0 
                ? ((double) report.getUnitsAlreadyRecalled() / totalProduced) * 100 
                : 0.0;
        report.setRecallCoverage(Math.round(recallCoverage * 100.0) / 100.0);

        return report;
    }

    public RecallCaseDto.RecallMetrics generateRecallMetrics(Long organizationId) {
        List<RecallCase> recalls = recallCaseRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
        long completed = recalls.stream().filter(recall -> recall.getStatus() == RecallStatus.COMPLETED).count();
        long active = recalls.stream()
                .filter(recall -> recall.getStatus() != RecallStatus.DRAFT && recall.getStatus() != RecallStatus.COMPLETED)
                .count();
        int productsInScope = recalls.stream()
                .map(RecallCase::getAffectedProductCount)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
        int productsRecovered = recalls.stream()
                .mapToInt(recall -> {
                    Integer returned = recallActionRepository.sumReturnedByRecallCaseId(recall.getId());
                    Integer quarantined = recallActionRepository.sumQuarantinedByRecallCaseId(recall.getId());
                    return Math.max(returned != null ? returned : 0, quarantined != null ? quarantined : 0);
                })
                .sum();
        int pending = Math.max(0, productsInScope - productsRecovered);
        double completion = productsInScope == 0 ? 0.0 : (productsRecovered * 100.0) / productsInScope;

        return RecallCaseDto.RecallMetrics.builder()
                .totalRecalls((long) recalls.size())
                .activeRecalls(active)
                .completedRecalls(completed)
                .totalProductsRecalled(productsInScope)
                .productsPending(pending)
                .completionPercentage(Math.round(completion * 100.0) / 100.0)
                .build();
    }

    public int calculateEstimatedCost(int affectedProductCount, String recallScope) {
        double baseCostPerUnit = 50.0;
        double multiplier = 1.0;

        switch (recallScope) {
            case "SINGLE_PRODUCT":
                multiplier = 1.0;
                break;
            case "MANUFACTURING_BATCH":
                multiplier = 0.8;
                break;
            case "QA_BATCH":
                multiplier = 0.7;
                break;
            case "PACKAGING_BATCH":
                multiplier = 0.6;
                break;
            case "TRANSPORT_BATCH":
                multiplier = 0.5;
                break;
            case "PRODUCT_LINE":
                multiplier = 0.4;
                break;
            case "FULL_RECALL":
                multiplier = 0.3;
                break;
        }

        return (int) (affectedProductCount * baseCostPerUnit * multiplier);
    }
}
