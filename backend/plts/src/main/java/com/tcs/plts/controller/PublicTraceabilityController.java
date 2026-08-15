package com.tcs.plts.controller;

import com.tcs.plts.dto.ApiResponse;
import com.tcs.plts.dto.PublicTraceabilityDto;
import com.tcs.plts.service.PublicTraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicTraceabilityController {

    private final PublicTraceabilityService publicTraceabilityService;

    @GetMapping("/traceability/{orderNumber}")
    public ResponseEntity<ApiResponse<PublicTraceabilityDto>> getTraceability(@PathVariable String orderNumber) {
        PublicTraceabilityDto response = publicTraceabilityService.getPublicTraceability(orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Public traceability retrieved", response));
    }

    @GetMapping("/qr-verify/{qrCode}")
    public ResponseEntity<ApiResponse<Object>> verifyQrCode(@PathVariable String qrCode) {
        Object response = publicTraceabilityService.verifyQrCode(qrCode);
        return ResponseEntity.ok(ApiResponse.success("QR code verified", response));
    }
}
