package com.skillconnect.server.controller;

import com.skillconnect.server.dto.response.ConnectionResponse;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.entity.Connection;
import com.skillconnect.server.entity.User;
import com.skillconnect.server.service.ConnectionService;
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
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;
    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("/request/{userId}")
    public ResponseEntity<ConnectionResponse> sendRequest(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        Connection c = connectionService.sendRequest(me.getId(), userId);
        return ResponseEntity.ok(toResponse(c));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ConnectionResponse> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(toResponse(connectionService.acceptRequest(id, me.getId())));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ConnectionResponse> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(toResponse(connectionService.rejectRequest(id, me.getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String,String>> remove(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        connectionService.removeConnection(id, me.getId());
        return ResponseEntity.ok(Map.of("message", "Connection removed"));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getConnections(
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        List<Connection> connections = connectionService.getAccepted(me.getId());
        List<UserResponse> users = connections.stream().map(c -> {
            User peer = c.getRequester().getId().equals(me.getId()) ? c.getAddressee() : c.getRequester();
            UserResponse r = userMapper.toResponse(peer);
            r.setConnectionStatus("ACCEPTED");
            return r;
        }).toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ConnectionResponse>> getPending(
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(connectionService.getPending(me.getId()).stream()
            .map(this::toResponse).toList());
    }

    @GetMapping("/pending/count")
    public ResponseEntity<Map<String, Long>> getPendingCount(
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        long count = connectionService.getPending(me.getId()).size();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<ConnectionResponse>> getSent(
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(connectionService.getSentPending(me.getId()).stream()
            .map(this::toResponse).toList());
    }

    private ConnectionResponse toResponse(Connection c) {
        ConnectionResponse r = new ConnectionResponse();
        r.setId(c.getId());
        r.setRequesterId(c.getRequester().getId());
        r.setRequesterUsername(c.getRequester().getUsername());
        r.setRequesterFullName(c.getRequester().getFullName());
        if (c.getRequester().getAvatar() != null) r.setRequesterAvatarPath(c.getRequester().getAvatar().getFilePath());
        r.setAddresseeId(c.getAddressee().getId());
        r.setAddresseeUsername(c.getAddressee().getUsername());
        r.setAddresseeFullName(c.getAddressee().getFullName());
        if (c.getAddressee().getAvatar() != null) r.setAddresseeAvatarPath(c.getAddressee().getAvatar().getFilePath());
        r.setStatus(c.getStatus().name());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
