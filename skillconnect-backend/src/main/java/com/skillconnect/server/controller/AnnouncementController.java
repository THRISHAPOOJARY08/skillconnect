package com.skillconnect.server.controller;

import com.skillconnect.server.entity.Announcement;
import com.skillconnect.server.entity.User;
import com.skillconnect.server.repository.AnnouncementRepository;
import com.skillconnect.server.repository.ConnectionRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepo;
    private final ConnectionRepository   connectionRepo;
    private final UserRepository         userRepo;
    private final UserService            userService;

    /**
     * POST /api/announcements
     * Body: { "message": "...", "recipientId": null|123 }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> post(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {

        User sender = userService.getCurrentUser(principal.getUsername());
        String message = (String) body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Message is required"));
        }

        Announcement ann = new Announcement();
        ann.setSender(sender);
        ann.setMessage(message.trim());

        Object recipIdObj = body.get("recipientId");
        if (recipIdObj != null) {
            long recipId = ((Number) recipIdObj).longValue();
            User recipient = userRepo.findById(recipId)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
            ann.setRecipient(recipient);
        }

        announcementRepo.save(ann);
        return ResponseEntity.ok(Map.of("id", ann.getId(), "message", "Posted"));
    }

    /**
     * GET /api/announcements
     * Returns all announcements visible to the current user (own + connections' broadcasts
     * + private ones addressed to them).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFeed(
            @AuthenticationPrincipal UserDetails principal) {

        User me = userService.getCurrentUser(principal.getUsername());
        List<Long> connectionIds = connectionRepo.findAcceptedConnectionIds(me.getId());

        List<Announcement> list = announcementRepo.findVisibleTo(me.getId(), connectionIds);

        List<Map<String, Object>> result = list.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",           a.getId());
            m.put("message",      a.getMessage());
            m.put("createdAt",    a.getCreatedAt());

            User s = a.getSender();
            m.put("senderId",        s.getId());
            m.put("senderUsername",  s.getUsername());
            m.put("senderFullName",  s.getFullName());
            m.put("senderAvatarPath", s.getAvatar() != null ? s.getAvatar().getFilePath() : null);

            if (a.getRecipient() != null) {
                User r = a.getRecipient();
                m.put("recipientId",       r.getId());
                m.put("recipientUsername", r.getUsername());
                m.put("recipientFullName", r.getFullName());
            } else {
                m.put("recipientId",       null);
                m.put("recipientUsername", null);
                m.put("recipientFullName", null);
            }
            return m;
        }).toList();

        return ResponseEntity.ok(result);
    }
}
