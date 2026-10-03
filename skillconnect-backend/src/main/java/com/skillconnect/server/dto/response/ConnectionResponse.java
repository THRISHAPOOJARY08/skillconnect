package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
public class ConnectionResponse {
    private Long id;
    private Long requesterId;
    private String requesterUsername;
    private String requesterFullName;
    private String requesterAvatarPath;
    private Long addresseeId;
    private String addresseeUsername;
    private String addresseeFullName;
    private String addresseeAvatarPath;
    private String status;
    private LocalDateTime createdAt;
}
