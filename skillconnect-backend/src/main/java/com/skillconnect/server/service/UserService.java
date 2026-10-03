package com.skillconnect.server.service;

import com.skillconnect.server.dto.request.UpdateProfileRequest;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final UserProfileRepository profileRepo;
    private final AvatarRepository avatarRepo;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public User getCurrentUser(String username) {
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse getProfile(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest req) {
        User user = getCurrentUser(username);
        if (req.getFullName() != null)  user.setFullName(req.getFullName());
        if (req.getBio() != null)       user.setBio(req.getBio());
        if (req.getCollege() != null)   user.setCollege(req.getCollege());
        if (req.getAvatarId() != null) {
            avatarRepo.findById(req.getAvatarId()).ifPresent(user::setAvatar);
        }
        userRepo.save(user);

        UserProfile profile = profileRepo.findByUserId(user.getId())
            .orElseGet(() -> { var p = new UserProfile(); p.setUser(user); return p; });
        if (req.getSkills() != null)    profile.setSkills(req.getSkills());
        if (req.getInterests() != null) profile.setInterests(req.getInterests());
        profileRepo.save(profile);

        return userMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = getCurrentUser(username);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
