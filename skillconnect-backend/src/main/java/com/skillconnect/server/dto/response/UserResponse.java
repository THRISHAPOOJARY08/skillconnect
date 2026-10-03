package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String college;
    private String avatarPath;
    private Long avatarId;
    private String skills;
    private String interests;
    private int totalPoints;
    private int totalAnswers;
    private int totalEvaluated;
    private String connectionStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, ACCEPTED
    private int connectionCount;
}
