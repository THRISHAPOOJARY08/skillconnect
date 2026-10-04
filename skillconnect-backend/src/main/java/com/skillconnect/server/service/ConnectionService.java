package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.entity.Connection.ConnectionStatus;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    @Transactional
    public Connection sendRequest(Long requesterId, Long addresseeId) {
        if (requesterId.equals(addresseeId))
            throw new IllegalArgumentException("Cannot connect with yourself");

        connectionRepo.findBetween(requesterId, addresseeId).ifPresent(c -> {
            throw new IllegalStateException("Connection already exists");
        });

        User requester = userRepo.findById(requesterId).orElseThrow();
        User addressee = userRepo.findById(addresseeId).orElseThrow();

        Connection conn = new Connection();
        conn.setRequester(requester);
        conn.setAddressee(addressee);
        conn.setStatus(ConnectionStatus.PENDING);
        conn = connectionRepo.save(conn);

        notificationService.create(addressee, "CONNECTION_REQUEST",
            requester.getUsername() + " sent you a connection request.", conn.getId(), "CONNECTION");
        return conn;
    }

    @Transactional
    public Connection acceptRequest(Long connectionId, Long userId) {
        Connection conn = connectionRepo.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));
        if (!conn.getAddressee().getId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        conn.setStatus(ConnectionStatus.ACCEPTED);
        conn = connectionRepo.save(conn);

        notificationService.create(conn.getRequester(), "CONNECTION_ACCEPTED",
            conn.getAddressee().getUsername() + " accepted your connection request.", conn.getId(), "CONNECTION");
        return conn;
    }

    @Transactional
    public Connection rejectRequest(Long connectionId, Long userId) {
        Connection conn = connectionRepo.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));
        if (!conn.getAddressee().getId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        conn.setStatus(ConnectionStatus.REJECTED);
        return connectionRepo.save(conn);
    }

    @Transactional
    public void removeConnection(Long connectionId, Long userId) {
        Connection conn = connectionRepo.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));
        if (!conn.getRequester().getId().equals(userId) && !conn.getAddressee().getId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        connectionRepo.delete(conn);
    }

    @Transactional(readOnly = true)
    public List<Connection> getAccepted(Long userId) {
        return connectionRepo.findAcceptedByUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Connection> getPending(Long userId) {
        return connectionRepo.findByAddresseeIdAndStatus(userId, ConnectionStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<Connection> getSentPending(Long userId) {
        return connectionRepo.findByRequesterIdAndStatus(userId, ConnectionStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<Long> getAcceptedIds(Long userId) {
        return connectionRepo.findAcceptedConnectionIds(userId);
    }

    @Transactional(readOnly = true)
    public boolean areConnected(Long a, Long b) {
        return connectionRepo.findBetween(a, b)
            .map(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
            .orElse(false);
    }
}
