package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long creatorId;
    private String creatorUsername;
    private String creatorFullName;
    private String creatorAvatarPath;
    private String topicName;
    private Long topicId;
    private String title;
    private String description;
    private String difficulty;
    private int maxPoints;
    private String status;
    private LocalDateTime createdAt;
    private Long groupId;
    private List<String> recipientUsernames;
    private AnswerResponse answer;
}
