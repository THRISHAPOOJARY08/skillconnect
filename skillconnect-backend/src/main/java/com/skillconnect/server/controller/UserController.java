package com.skillconnect.server.controller;

import com.skillconnect.server.dto.request.UpdateProfileRequest;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.entity.Avatar;
import com.skillconnect.server.entity.Connection.ConnectionStatus;
import com.skillconnect.server.entity.User;
import com.skillconnect.server.repository.AvatarRepository;
import com.skillconnect.server.repository.ConnectionRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.UserMapper;
import com.skillconnect.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepo;
    private final UserMapper userMapper;
    private final AvatarRepository avatarRepo;
    private final ConnectionRepository connectionRepo;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(principal.getUsername(), req));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String,String>> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String,String> body) {
        userService.changePassword(principal.getUsername(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @AuthenticationPrincipal UserDetails principal) {
        User current = userService.getCurrentUser(principal.getUsername());
        List<User> users = userRepo.findAll().stream()
                .filter(u -> !u.getId().equals(current.getId()))
                .toList();
        // Annotate each with their connection status relative to the current user
        List<Long> acceptedIds = connectionRepo.findAcceptedConnectionIds(current.getId());
        List<Long> sentIds = connectionRepo
                .findByRequesterIdAndStatus(current.getId(), ConnectionStatus.PENDING)
                .stream().map(c -> c.getAddressee().getId()).toList();
        List<Long> receivedIds = connectionRepo
                .findByAddresseeIdAndStatus(current.getId(), ConnectionStatus.PENDING)
                .stream().map(c -> c.getRequester().getId()).toList();
        return ResponseEntity.ok(users.stream().map(u -> {
            UserResponse r = userMapper.toResponse(u);
            if (acceptedIds.contains(u.getId()))      r.setConnectionStatus("ACCEPTED");
            else if (sentIds.contains(u.getId()))     r.setConnectionStatus("PENDING_SENT");
            else if (receivedIds.contains(u.getId())) r.setConnectionStatus("PENDING_RECEIVED");
            else                                       r.setConnectionStatus("NONE");
            return r;
        }).toList());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails principal) {
        User current = userService.getCurrentUser(principal.getUsername());
        List<User> users = userRepo.searchUsers(q, current.getId());
        // Annotate with connection status too
        List<Long> acceptedIds = connectionRepo.findAcceptedConnectionIds(current.getId());
        List<Long> sentIds = connectionRepo
                .findByRequesterIdAndStatus(current.getId(), ConnectionStatus.PENDING)
                .stream().map(c -> c.getAddressee().getId()).toList();
        List<Long> receivedIds = connectionRepo
                .findByAddresseeIdAndStatus(current.getId(), ConnectionStatus.PENDING)
                .stream().map(c -> c.getRequester().getId()).toList();
        return ResponseEntity.ok(users.stream().map(u -> {
            UserResponse r = userMapper.toResponse(u);
            if (acceptedIds.contains(u.getId()))      r.setConnectionStatus("ACCEPTED");
            else if (sentIds.contains(u.getId()))     r.setConnectionStatus("PENDING_SENT");
            else if (receivedIds.contains(u.getId())) r.setConnectionStatus("PENDING_RECEIVED");
            else                                       r.setConnectionStatus("NONE");
            return r;
        }).toList());
    }

    @GetMapping("/avatars")
    public ResponseEntity<List<Avatar>> getAvatars() {
        return ResponseEntity.ok(avatarRepo.findAll());
    }
}
