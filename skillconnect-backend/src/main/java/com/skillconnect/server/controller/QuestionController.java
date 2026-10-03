package com.skillconnect.server.controller;

import com.skillconnect.server.dto.request.CreateQuestionRequest;
import com.skillconnect.server.dto.response.QuestionResponse;
import com.skillconnect.server.entity.Topic;
import com.skillconnect.server.entity.User;
import com.skillconnect.server.repository.TopicRepository;
import com.skillconnect.server.service.QuestionService;
import com.skillconnect.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final TopicRepository topicRepo;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<QuestionResponse> create(
            @Valid @RequestBody CreateQuestionRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(questionService.createQuestion(principal.getUsername(), req));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<QuestionResponse>> getSent(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(questionService.getSentQuestions(principal.getUsername()));
    }

    @GetMapping("/received")
    public ResponseEntity<List<QuestionResponse>> getReceived(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(questionService.getReceivedQuestions(principal.getUsername()));
    }

    @GetMapping("/received/count")
    public ResponseEntity<Map<String, Long>> getReceivedCount(@AuthenticationPrincipal UserDetails principal) {
        long count = questionService.getReceivedQuestions(principal.getUsername())
            .stream().filter(q -> "PENDING".equals(q.getStatus())).count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(questionService.getById(id, principal.getUsername()));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics() {
        return ResponseEntity.ok(topicRepo.findAll());
    }

    @PostMapping("/topics")
    public ResponseEntity<Topic> createTopic(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Topic name cannot be empty");
        }
        name = name.trim();
        if (topicRepo.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Topic already exists");
        }
        Topic topic = new Topic();
        topic.setName(name);
        return ResponseEntity.ok(topicRepo.save(topic));
    }
}
