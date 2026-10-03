package com.skillconnect.server.controller;

import com.skillconnect.server.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String,Object>> getSummary(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(dashboardService.getSummary(principal.getUsername()));
    }
}
