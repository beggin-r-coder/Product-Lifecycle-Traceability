package com.tcs.plts.service;

import com.tcs.plts.entity.DefectCase;
import com.tcs.plts.entity.ProductBatch;
import com.tcs.plts.repository.DefectCaseRepository;
import com.tcs.plts.repository.ProductBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RootCauseAnalysisService {

    private final ProductBatchRepository productBatchRepository;
    private final DefectCaseRepository defectCaseRepository;

    public RootCauseAnalysisResult analyzeRootCause(String batchId, Long orderId) {
        RootCauseAnalysisResult result = new RootCauseAnalysisResult();

        if (orderId == null) {
            return result;
        }
        
        List<ProductBatch> batches = productBatchRepository.findByOrderIdOrderByTimestampAsc(orderId);
        Map<String, Integer> factorCounts = new HashMap<>();
        
        for (ProductBatch batch : batches) {
            if (batch.getMachineId() != null) {
                factorCounts.merge("Machine-" + batch.getMachineId(), 1, Integer::sum);
            }
            if (batch.getProductionLine() != null) {
                factorCounts.merge("ProductionLine-" + batch.getProductionLine(), 1, Integer::sum);
            }
            if (batch.getShift() != null) {
                factorCounts.merge("Shift-" + batch.getShift(), 1, Integer::sum);
            }
            if (batch.getOperator() != null) {
                factorCounts.merge("Operator-" + batch.getOperator(), 1, Integer::sum);
            }
            if (batch.getRawMaterialLot() != null) {
                factorCounts.merge("RawMaterial-" + batch.getRawMaterialLot(), 1, Integer::sum);
            }
        }
        
        String mostLikelyCause = factorCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
        
        int maxCount = factorCounts.getOrDefault(mostLikelyCause, 0);
        double confidenceScore = calculateConfidenceScore(maxCount, batches.size());
        
        result.setProbableRootCause(mostLikelyCause);
        result.setConfidenceScore(confidenceScore);
        result.setContributingFactors(new ArrayList<>(factorCounts.keySet()));
        result.setAffectedBatches(batches.stream().map(ProductBatch::getBatchId).toList());
        
        List<DefectCase> similarCases = defectCaseRepository.findByBatchNumber(batchId);
        result.setSimilarHistoricalCases(similarCases.stream().map(DefectCase::getDefectCaseId).toList());
        
        return result;
    }
    
    private double calculateConfidenceScore(int maxCount, int totalBatches) {
        if (totalBatches == 0) return 0.0;
        double ratio = (double) maxCount / totalBatches;
        return Math.min(95.0, ratio * 100);
    }
    
    public static class RootCauseAnalysisResult {
        private String probableRootCause;
        private double confidenceScore;
        private List<String> contributingFactors;
        private List<String> affectedBatches;
        private List<String> similarHistoricalCases;
        
        public RootCauseAnalysisResult() {
            this.contributingFactors = new ArrayList<>();
            this.affectedBatches = new ArrayList<>();
            this.similarHistoricalCases = new ArrayList<>();
        }
        
        public String getProbableRootCause() {
            return probableRootCause;
        }
        
        public void setProbableRootCause(String probableRootCause) {
            this.probableRootCause = probableRootCause;
        }
        
        public double getConfidenceScore() {
            return confidenceScore;
        }
        
        public void setConfidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }
        
        public List<String> getContributingFactors() {
            return contributingFactors;
        }
        
        public void setContributingFactors(List<String> contributingFactors) {
            this.contributingFactors = contributingFactors;
        }
        
        public List<String> getAffectedBatches() {
            return affectedBatches;
        }
        
        public void setAffectedBatches(List<String> affectedBatches) {
            this.affectedBatches = affectedBatches;
        }
        
        public List<String> getSimilarHistoricalCases() {
            return similarHistoricalCases;
        }
        
        public void setSimilarHistoricalCases(List<String> similarHistoricalCases) {
            this.similarHistoricalCases = similarHistoricalCases;
        }
    }
}
