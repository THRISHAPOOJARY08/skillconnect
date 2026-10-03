package com.skillconnect.server.controller;

import com.skillconnect.server.dto.request.LoginRequest;
import com.skillconnect.server.dto.request.RegisterRequest;
import com.skillconnect.server.dto.response.AuthResponse;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String,String>> forgotPassword(@RequestBody Map<String,String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String,String>> resetPassword(@RequestBody Map<String,String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /** GET /api/auth/check-username?username=foo
     *  Returns { available: true/false }
     *  No auth required — used during registration. */
    @GetMapping("/check-username")
    public ResponseEntity<Map<String,Boolean>> checkUsername(@RequestParam String username) {
        boolean available = !userRepo.existsByUsername(username.trim().toLowerCase());
        return ResponseEntity.ok(Map.of("available", available));
    }
}
