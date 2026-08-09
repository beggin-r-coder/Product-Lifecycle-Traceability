package com.tcs.plts.dto;

import com.tcs.plts.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String generatedUserId;
    private Role role;
    private String name;
    private String companyName;
    private Long organizationId;
    private boolean verified;
}
