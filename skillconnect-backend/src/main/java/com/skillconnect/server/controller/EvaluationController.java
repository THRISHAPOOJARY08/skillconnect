package com.skillconnect.server.controller;

import com.skillconnect.server.dto.response.EvaluationResponse;
import com.skillconnect.server.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/{answerId}")
    public ResponseEntity<EvaluationResponse> evaluate(
            @PathVariable Long answerId,
            @RequestBody Map<String,Object> body,
            @AuthenticationPrincipal UserDetails principal) {
        int pts = Integer.parseInt(body.get("awardedPoints").toString());
        String feedback = (String) body.get("feedback");
        return ResponseEntity.ok(
            evaluationService.evaluate(answerId, principal.getUsername(), pts, feedback));
    }

    @GetMapping("/answer/{answerId}")
    public ResponseEntity<EvaluationResponse> getByAnswer(@PathVariable Long answerId) {
        return ResponseEntity.ok(evaluationService.getByAnswerId(answerId));
    }
}
