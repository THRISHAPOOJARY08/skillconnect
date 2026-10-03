package com.skillconnect.server.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank @Size(max=255)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Long topicId;

    @NotNull
    private String difficulty; // EASY, MEDIUM, HARD

    @NotNull @Min(1)
    private Integer maxPoints;

    @NotEmpty
    private List<Long> recipientIds;

    private Long groupId; // optional - for group questions
}
