package com.skillconnect.server.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
public class EvaluationResponse {
    private Long id;
    private Long answerId;
    private Long evaluatorId;
    private String evaluatorUsername;
    private int awardedPoints;
    private int maxPoints;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
