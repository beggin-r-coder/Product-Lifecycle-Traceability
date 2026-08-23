package com.tcs.plts.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tcs.plts.dto.DefectCaseDto;
import com.tcs.plts.dto.ProductBatchDto;
import com.tcs.plts.entity.*;
import com.tcs.plts.repository.OrderRepository;
import com.tcs.plts.repository.ProductBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BacktrackingEngineService {

    private final ProductBatchRepository productBatchRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public List<DefectCaseDto.BacktrackingTimeline> backtrackProductHistory(String productSerialNumber, Long orderId) {
        List<DefectCaseDto.BacktrackingTimeline> timeline = new ArrayList<>();

        if (orderId == null) {
            return timeline;
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return timeline;
        }

        List<ProductBatch> batches = productBatchRepository.findByOrderIdOrderByTimestampAsc(orderId);

        for (ProductBatch batch : batches) {
            DefectCaseDto.BacktrackingTimeline stage = DefectCaseDto.BacktrackingTimeline.builder()
                    .stage(batch.getBatchType())
                    .stakeholderName(batch.getStakeholderName())
                    .stakeholderId(batch.getStakeholder() != null ? batch.getStakeholder().getGeneratedUserId() : null)
                    .batchNumber(batch.getBatchId())
                    .timestamp(batch.getTimestamp())
                    .responsiblePerson(batch.getOperator())
                    .documents(parseJsonList(batch.getDocuments()))
                    .certificates(parseJsonList(batch.getCertificates()))
                    .photos(parseJsonList(batch.getPhotos()))
                    .remarks(batch.getRemarks())
                    .build();

            timeline.add(stage);
        }

        return timeline;
    }

    public List<ProductBatchDto.BacktrackingNode> getBacktrackingGraph(String productSerialNumber, Long orderId) {
        List<ProductBatchDto.BacktrackingNode> nodes = new ArrayList<>();

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return nodes;
        }

        List<ProductBatch> batches = productBatchRepository.findByOrderIdOrderByTimestampAsc(orderId);

        for (ProductBatch batch : batches) {
            ProductBatchDto.BacktrackingNode node = ProductBatchDto.BacktrackingNode.builder()
                    .stage(batch.getBatchType())
                    .batchId(batch.getBatchId())
                    .stakeholderName(batch.getStakeholderName())
                    .stakeholderId(batch.getStakeholder() != null ? batch.getStakeholder().getGeneratedUserId() : null)
                    .company(batch.getStakeholderName())
                    .timestamp(batch.getTimestamp())
                    .responsiblePerson(batch.getOperator())
                    .documents(parseJsonList(batch.getDocuments()))
                    .certificates(parseJsonList(batch.getCertificates()))
                    .photos(parseJsonList(batch.getPhotos()))
                    .machineId(batch.getMachineId())
                    .productionLine(batch.getProductionLine())
                    .shift(batch.getShift())
                    .operator(batch.getOperator())
                    .rawMaterialLot(batch.getRawMaterialLot())
                    .build();

            nodes.add(node);
        }

        return nodes;
    }

    public List<DefectCaseDto.AffectedProduct> identifyAffectedProducts(String batchId, String batchType) {
        List<DefectCaseDto.AffectedProduct> affectedProducts = new ArrayList<>();

        List<ProductBatch> relatedBatches = new ArrayList<>();

        if ("MANUFACTURING".equals(batchType)) {
            productBatchRepository.findByBatchId(batchId).ifPresent(relatedBatches::add);
            relatedBatches.addAll(productBatchRepository.findByParentBatchId(batchId));
        } else if ("RAW_MATERIAL".equals(batchType)) {
            relatedBatches.addAll(productBatchRepository.findByRawMaterialLot(batchId));
        } else {
            ProductBatch parentBatch = productBatchRepository.findByBatchId(batchId).orElse(null);
            if (parentBatch != null && parentBatch.getParentBatchId() != null) {
                relatedBatches.addAll(productBatchRepository.findByParentBatchId(parentBatch.getParentBatchId()));
            }
        }

        for (ProductBatch batch : relatedBatches) {
            String riskLevel = determineRiskLevel(batch, batchId, batchType);
            String riskReason = determineRiskReason(batch, batchId, batchType);

            DefectCaseDto.AffectedProduct product = DefectCaseDto.AffectedProduct.builder()
                    .productId(batch.getBatchId())
                    .serialNumber(batch.getBatchId())
                    .batchNumber(batch.getBatchId())
                    .riskLevel(riskLevel)
                    .riskReason(riskReason)
                    .currentLocation(batch.getStakeholderName())
                    .status("IN_SUPPLY_CHAIN")
                    .build();

            affectedProducts.add(product);
        }

        return affectedProducts;
    }

    private String determineRiskLevel(ProductBatch batch, String originalBatchId, String batchType) {
        if (batch.getBatchId().equals(originalBatchId)) {
            return "CRITICAL";
        }

        if (batch.getParentBatchId() != null && batch.getParentBatchId().equals(originalBatchId)) {
            return "HIGH";
        }

        if (batch.getRawMaterialLot() != null && batch.getRawMaterialLot().equals(originalBatchId)) {
            return "HIGH";
        }

        if (batch.getProductionLine() != null) {
            ProductBatch originalBatch = productBatchRepository.findByBatchId(originalBatchId).orElse(null);
            if (originalBatch != null && originalBatch.getProductionLine() != null 
                    && batch.getProductionLine().equals(originalBatch.getProductionLine())) {
                return "MEDIUM";
            }
        }

        return "LOW";
    }

    private String determineRiskReason(ProductBatch batch, String originalBatchId, String batchType) {
        if (batch.getBatchId().equals(originalBatchId)) {
            return "Same manufacturing batch";
        }

        if (batch.getParentBatchId() != null && batch.getParentBatchId().equals(originalBatchId)) {
            return "Same parent batch";
        }

        if (batch.getRawMaterialLot() != null && batch.getRawMaterialLot().equals(originalBatchId)) {
            return "Same raw material lot";
        }

        ProductBatch originalBatch = productBatchRepository.findByBatchId(originalBatchId).orElse(null);
        if (originalBatch != null && originalBatch.getProductionLine() != null 
                && batch.getProductionLine() != null 
                && batch.getProductionLine().equals(originalBatch.getProductionLine())) {
            return "Same production line";
        }

        return "Same manufacturer";
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Error parsing JSON list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public String traceFaultOrigin(String productSerialNumber, Long orderId) {
        StringBuilder result = new StringBuilder();
        result.append("ROOT CAUSE IDENTIFICATION\n\n");

        List<ProductBatch> batches = productBatchRepository.findByOrderIdOrderByTimestampAsc(orderId);
        
        if (batches.isEmpty()) {
            result.append("No batch history found for this product.");
            return result.toString();
        }

        result.append("Tracing product lifecycle in reverse:\n\n");

        List<ProductBatch> reversedBatches = new ArrayList<>(batches);
        java.util.Collections.reverse(reversedBatches);

        for (ProductBatch batch : reversedBatches) {
            result.append(String.format("Stage: %s\n", batch.getBatchType()));
            result.append(String.format("Batch ID: %s\n", batch.getBatchId()));
            result.append(String.format("Stakeholder: %s\n", batch.getStakeholderName()));
            result.append(String.format("Timestamp: %s\n", batch.getTimestamp()));
            
            if (batch.getMachineId() != null) {
                result.append(String.format("Machine: %s\n", batch.getMachineId()));
            }
            if (batch.getProductionLine() != null) {
                result.append(String.format("Production Line: %s\n", batch.getProductionLine()));
            }
            if (batch.getShift() != null) {
                result.append(String.format("Shift: %s\n", batch.getShift()));
            }
            if (batch.getOperator() != null) {
                result.append(String.format("Operator: %s\n", batch.getOperator()));
            }
            if (batch.getRawMaterialLot() != null) {
                result.append(String.format("Raw Material Lot: %s\n", batch.getRawMaterialLot()));
            }
            
            result.append("\n---\n\n");
        }

        ProductBatch manufacturingBatch = batches.stream()
                .filter(b -> "MANUFACTURING".equals(b.getBatchType()))
                .findFirst()
                .orElse(null);

        if (manufacturingBatch != null) {
            result.append("ROOT CAUSE IDENTIFIED\n\n");
            result.append(String.format("Manufacturing Batch: %s\n", manufacturingBatch.getBatchId()));
            
            if (manufacturingBatch.getMachineId() != null) {
                result.append(String.format("Machine: %s\n", manufacturingBatch.getMachineId()));
            }
            if (manufacturingBatch.getShift() != null) {
                result.append(String.format("Shift: %s\n", manufacturingBatch.getShift()));
            }
            
            result.append(String.format("Affected Units: %d\n", manufacturingBatch.getQuantity()));
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                result.append(String.format("Order Quantity: %d\n", order.getQuantity()));
            }
            
            result.append("\nRECALL RECOMMENDED\n");
        }

        return result.toString();
    }
}
