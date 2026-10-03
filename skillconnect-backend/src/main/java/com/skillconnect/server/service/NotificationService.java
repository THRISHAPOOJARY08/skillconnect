package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;

    @Transactional
    public void create(User recipient, String type, String message, Long refId, String refType) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setMessage(message);
        n.setReferenceId(refId);
        n.setReferenceType(refType);
        notifRepo.save(n);
    }
}
