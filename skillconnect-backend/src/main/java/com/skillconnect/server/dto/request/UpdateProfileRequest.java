package com.skillconnect.server.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String college;
    private Long avatarId;
    private String skills;
    private String interests;
}
