package com.skillconnect.server.controller;

import com.skillconnect.server.entity.User;
import com.skillconnect.server.service.LeaderboardService;
import com.skillconnect.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> getLeaderboard(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Long topicId,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(leaderboardService.getLeaderboard(me.getId(), filter, topicId));
    }
}
