package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
public class AnswerResponse {
    private Long id;
    private Long questionId;
    private Long answererId;
    private String answererUsername;
    private String answererFullName;
    private String answererAvatarPath;
    private String content;
    private LocalDateTime submittedAt;
    private EvaluationResponse evaluation;
}
