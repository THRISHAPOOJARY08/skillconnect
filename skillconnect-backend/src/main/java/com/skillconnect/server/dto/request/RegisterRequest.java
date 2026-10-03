package com.skillconnect.server.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=3, max=50)
    private String username;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min=6, max=100)
    private String password;

    @NotBlank
    private String fullName;

    private String bio;
    private String college;
    private Long avatarId;
    private String skills;
    private String interests;
}
