package com.skillconnect.server.controller;

import com.skillconnect.server.dto.response.GroupResponse;
import com.skillconnect.server.dto.response.QuestionResponse;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.entity.User;
import com.skillconnect.server.repository.GroupRepository;
import com.skillconnect.server.repository.QuestionRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.GroupService;
import com.skillconnect.server.service.QuestionService;
import com.skillconnect.server.service.UserMapper;
import com.skillconnect.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserRepository userRepo;
    private final QuestionRepository questionRepo;
    private final GroupRepository groupRepo;
    private final UserMapper userMapper;
    private final QuestionService questionService;
    private final GroupService groupService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Map<String,Object>> search(
            @RequestParam String q,
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        Map<String,Object> results = new LinkedHashMap<>();

        if (type == null || "users".equalsIgnoreCase(type)) {
            List<UserResponse> users = userRepo.searchUsers(q, me.getId())
                .stream().map(userMapper::toResponse).toList();
            results.put("users", users);
        }

        if (type == null || "questions".equalsIgnoreCase(type)) {
            List<QuestionResponse> questions = questionRepo.searchQuestions(q)
                .stream().map(questionService::toResponse).toList();
            results.put("questions", questions);
        }

        if (type == null || "groups".equalsIgnoreCase(type)) {
            List<GroupResponse> groups = groupRepo.searchGroups(q)
                .stream().map(g -> groupService.toResponse(g, me.getId())).toList();
            results.put("groups", groups);
        }

        return ResponseEntity.ok(results);
    }
}
