package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String topicName;
    private String visibility;
    private Long creatorId;
    private String creatorUsername;
    private int memberCount;
    private boolean member;
    private LocalDateTime createdAt;
}
