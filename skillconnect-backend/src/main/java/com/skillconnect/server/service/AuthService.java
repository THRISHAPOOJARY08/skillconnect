package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.dto.request.RegisterRequest;
import com.skillconnect.server.dto.request.LoginRequest;
import com.skillconnect.server.dto.response.AuthResponse;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.repository.*;
import com.skillconnect.server.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final UserProfileRepository profileRepo;
    private final UserScoreRepository scoreRepo;
    private final AvatarRepository avatarRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setBio(req.getBio());
        user.setCollege(req.getCollege());

        if (req.getAvatarId() != null) {
            avatarRepo.findById(req.getAvatarId()).ifPresent(user::setAvatar);
        }

        user = userRepo.save(user);

        // Create profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setSkills(req.getSkills());
        profile.setInterests(req.getInterests());
        profileRepo.save(profile);

        // Create score record
        UserScore score = new UserScore();
        score.setUser(user);
        scoreRepo.save(score);

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, userMapper.toResponse(user));
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword())
        );
        User user = userRepo.findByUsernameOrEmail(req.getUsernameOrEmail(), req.getUsernameOrEmail())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, userMapper.toResponse(user));
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepo.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepo.save(user);
            emailService.sendPasswordReset(user.getEmail(), token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByResetToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Reset token has expired");

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);
    }
}
