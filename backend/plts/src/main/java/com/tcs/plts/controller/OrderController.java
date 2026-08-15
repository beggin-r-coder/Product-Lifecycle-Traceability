package com.tcs.plts.controller;

import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.OrderDto;
import com.tcs.plts.service.ExportService;
import com.tcs.plts.service.OrderService;
import com.tcs.plts.util.QrCodeGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ExportService exportService;
    private final QrCodeGenerator qrCodeGenerator;

    @PostMapping("/org/{orgId}")
    public ResponseEntity<ApiResponse<OrderDto.Response>> createOrder(
            @PathVariable Long orgId,
            @Valid @RequestBody OrderDto.CreateRequest request) {
        OrderDto.Response response = orderService.createOrder(orgId, request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<ApiResponse<List<OrderDto.Response>>> getOrgOrders(@PathVariable Long orgId) {
        List<OrderDto.Response> orders = orderService.getOrdersByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved", orders));
    }

    @GetMapping("/stakeholder/{stakeholderId}")
    public ResponseEntity<ApiResponse<List<OrderDto.Response>>> getStakeholderOrders(
            @PathVariable Long stakeholderId,
            @RequestParam Role role) {
        List<OrderDto.Response> orders = orderService.getOrdersForStakeholder(stakeholderId, role);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder orders retrieved", orders));
    }

    @GetMapping("/stakeholder/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderDto.Response>>> getOrdersForLoggedInStakeholder(
            @PathVariable Long userId,
            @RequestParam Role role) {
        List<OrderDto.Response> orders = orderService.getOrdersForStakeholderUser(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder orders retrieved", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto.Response>> getOrderById(@PathVariable Long id) {
        OrderDto.Response response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order detail", response));
    }

    @PostMapping("/{id}/assign-manufacturer")
    public ResponseEntity<ApiResponse<OrderDto.Response>> assignManufacturer(
            @PathVariable Long id,
            @RequestBody OrderDto.AssignStakeholderRequest request) {
        OrderDto.Response response = orderService.assignManufacturer(id, request.getStakeholderId(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.success("Manufacturer assigned", response));
    }

    @PostMapping("/{id}/manufacturer-status")
    public ResponseEntity<ApiResponse<OrderDto.Response>> updateManufacturerStatus(
            @PathVariable Long id,
            @RequestParam String action,
            @RequestBody(required = false) OrderDto.UpdateManufacturerProgressRequest request) {
        OrderDto.Response response = orderService.updateManufacturerStatus(id, action, request);
        return ResponseEntity.ok(ApiResponse.success("Manufacturer status updated", response));
    }

    @PostMapping("/{id}/assign-qa")
    public ResponseEntity<ApiResponse<OrderDto.Response>> assignQa(
            @PathVariable Long id,
            @RequestBody OrderDto.AssignStakeholderRequest request) {
        OrderDto.Response response = orderService.assignQa(id, request.getStakeholderId(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.success("QA assigned", response));
    }

    @PostMapping("/{id}/qa-status")
    public ResponseEntity<ApiResponse<OrderDto.Response>> updateQaStatus(
            @PathVariable Long id,
            @RequestParam String action,
            @RequestBody(required = false) OrderDto.UpdateQaReportRequest request) {
        OrderDto.Response response = orderService.updateQaStatus(id, action, request);
        return ResponseEntity.ok(ApiResponse.success("QA status updated", response));
    }

    @PostMapping("/{id}/assign-packaging")
    public ResponseEntity<ApiResponse<OrderDto.Response>> assignPackaging(
            @PathVariable Long id,
            @RequestBody OrderDto.AssignStakeholderRequest request) {
        OrderDto.Response response = orderService.assignPackaging(id, request.getStakeholderId(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.success("Packaging assigned", response));
    }

    @PostMapping("/{id}/packaging-status")
    public ResponseEntity<ApiResponse<OrderDto.Response>> updatePackagingStatus(
            @PathVariable Long id,
            @RequestParam String action,
            @RequestBody(required = false) OrderDto.UpdateShippingDetailsRequest request) {
        OrderDto.Response response = orderService.updatePackagingStatus(id, action, request);
        return ResponseEntity.ok(ApiResponse.success("Packaging status updated", response));
    }

    @PostMapping("/{id}/assign-retailer")
    public ResponseEntity<ApiResponse<OrderDto.Response>> assignRetailer(
            @PathVariable Long id,
            @RequestBody OrderDto.AssignStakeholderRequest request) {
        OrderDto.Response response = orderService.assignRetailer(id, request.getStakeholderId(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.success("Retailer assigned", response));
    }

    @PostMapping("/{id}/retailer-status")
    public ResponseEntity<ApiResponse<OrderDto.Response>> updateRetailerStatus(
            @PathVariable Long id,
            @RequestParam String action) {
        OrderDto.Response response = orderService.updateRetailerStatus(id, action);
        return ResponseEntity.ok(ApiResponse.success("Retailer status updated", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto.Response>> cancelOrder(
            @PathVariable Long id,
            @RequestBody OrderDto.CancelOrderRequest request) {
        OrderDto.Response response = orderService.cancelOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    @GetMapping("/{id}/qr-code")
    public ResponseEntity<ApiResponse<Map<String, String>>> getQrCode(@PathVariable Long id) {
        OrderDto.Response order = orderService.getOrderById(id);
        String qrBase64 = qrCodeGenerator.generateQrCodeBase64(order.getOrderNumber(), 300, 300);
        return ResponseEntity.ok(ApiResponse.success("QR code generated", Map.of("orderNumber", order.getOrderNumber(), "qrCode", qrBase64)));
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<InputStreamResource> exportPdf(@PathVariable Long id) {
        OrderDto.Response order = orderService.getOrderById(id);
        ByteArrayInputStream pdfStream = exportService.exportOrderPdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Order-" + order.getOrderNumber() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @GetMapping("/org/{orgId}/export-excel")
    public ResponseEntity<InputStreamResource> exportExcel(@PathVariable Long orgId) {
        List<OrderDto.Response> orders = orderService.getOrdersByOrg(orgId);
        ByteArrayInputStream excelStream = exportService.exportOrdersToExcel(orders);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Orders-Report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }
}
