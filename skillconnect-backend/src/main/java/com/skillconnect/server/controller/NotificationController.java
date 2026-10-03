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
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notifRepo;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Map<String,Object>> getNotifications(
            @RequestParam(required = false) Boolean unread,
            @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        List<Notification> all = notifRepo.findByRecipientIdOrderByCreatedAtDesc(me.getId());
        long unreadCount = notifRepo.countByRecipientIdAndReadFalse(me.getId());

        List<Map<String,Object>> items = all.stream().map(n -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id",            n.getId());
            m.put("type",          n.getType());
            m.put("message",       n.getMessage());
            m.put("read",          n.isRead());
            m.put("referenceId",   n.getReferenceId());
            m.put("referenceType", n.getReferenceType());
            m.put("createdAt",     n.getCreatedAt().toString());
            return m;
        }).toList();

        return ResponseEntity.ok(Map.of("notifications", items, "unreadCount", unreadCount));
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Map<String,String>> markRead(@PathVariable Long id) {
        notifRepo.findById(id).ifPresent(n -> { n.setRead(true); notifRepo.save(n); });
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<Map<String,String>> markAllRead(@AuthenticationPrincipal UserDetails principal) {
        User me = userService.getCurrentUser(principal.getUsername());
        notifRepo.markAllReadByUser(me.getId());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
