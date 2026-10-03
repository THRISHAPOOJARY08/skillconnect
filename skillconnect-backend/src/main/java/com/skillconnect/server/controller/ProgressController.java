package com.skillconnect.server.controller;

import com.skillconnect.server.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String,Object>> getSummary(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(progressService.getSummary(principal.getUsername()));
    }

    @GetMapping("/topic-scores")
    public ResponseEntity<List<Map<String,Object>>> getTopicScores(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(progressService.getTopicScores(principal.getUsername()));
    }

    @GetMapping("/time-series")
    public ResponseEntity<List<Map<String,Object>>> getTimeSeries(
            @RequestParam(defaultValue = "weekly") String period,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(progressService.getTimeSeries(principal.getUsername(), period));
    }
}
