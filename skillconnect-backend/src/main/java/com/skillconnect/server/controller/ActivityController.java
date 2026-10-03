package com.skillconnect.server.controller;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import com.skillconnect.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityLogRepository activityLogRepo;
    private final AnswerRepository answerRepo;
    private final UserService userService;

    @PostMapping("/{answerId}")
    @Transactional
    public ResponseEntity<Map<String,String>> saveLogs(
            @PathVariable Long answerId,
            @RequestBody List<Map<String,Object>> events,
            @AuthenticationPrincipal UserDetails principal) {
        User user = userService.getCurrentUser(principal.getUsername());
        Answer answer = answerRepo.findById(answerId)
            .orElseThrow(() -> new RuntimeException("Answer not found"));

        for (Map<String,Object> event : events) {
            ActivityLog log = new ActivityLog();
            log.setAnswer(answer);
            log.setUser(user);
            log.setEventType((String) event.get("eventType"));
            String ts = (String) event.getOrDefault("timestamp", LocalDateTime.now().toString());
            log.setEventTimestamp(LocalDateTime.parse(ts.substring(0, 19)));
            log.setMetadata(event.containsKey("metadata") ? event.get("metadata").toString() : null);
            activityLogRepo.save(log);
        }
        return ResponseEntity.ok(Map.of("message", "Activity logs saved"));
    }

    @GetMapping("/answer/{answerId}")
    public ResponseEntity<Map<String,Object>> getLogsForAnswer(@PathVariable Long answerId) {
        List<ActivityLog> logs = activityLogRepo.findByAnswerIdOrderByEventTimestampAsc(answerId);

        Map<String,Long> counts = new LinkedHashMap<>();
        for (ActivityLog l : logs) {
            counts.merge(l.getEventType(), 1L, Long::sum);
        }

        List<Map<String,Object>> items = logs.stream().map(l -> Map.<String,Object>of(
            "eventType", l.getEventType(),
            "timestamp", l.getEventTimestamp().toString()
        )).toList();

        return ResponseEntity.ok(Map.of("summary", counts, "events", items));
    }
}
