package com.skillconnect.server.controller;

import com.skillconnect.server.dto.response.AnswerResponse;
import com.skillconnect.server.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    @PostMapping("/{questionId}")
    public ResponseEntity<AnswerResponse> submitAnswer(
            @PathVariable Long questionId,
            @RequestBody Map<String,String> body,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
            answerService.submitAnswer(questionId, principal.getUsername(), body.get("content")));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<AnswerResponse> getAnswer(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.getAnswerForQuestion(questionId));
    }
}
