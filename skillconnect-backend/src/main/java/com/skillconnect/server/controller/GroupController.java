package com.skillconnect.server.controller;

import com.skillconnect.server.dto.request.CreateQuestionRequest;
import com.skillconnect.server.dto.response.GroupResponse;
import com.skillconnect.server.dto.response.QuestionResponse;
import com.skillconnect.server.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @RequestBody Map<String,Object> req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(groupService.createGroup(principal.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(groupService.getMyGroups(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroup(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(groupService.getById(id, principal.getUsername()));
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuestionResponse> postGroupQuestion(
            @PathVariable Long id,
            @RequestBody CreateQuestionRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(groupService.postGroupQuestion(id, principal.getUsername(), req));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionResponse>> getGroupQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupQuestions(id));
    }
}
