package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Connection;
import com.skillconnect.server.entity.Connection.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    // Find connection between two users (either direction)
    @Query("""
        SELECT c FROM Connection c
        WHERE (c.requester.id = :a AND c.addressee.id = :b)
           OR (c.requester.id = :b AND c.addressee.id = :a)
        """)
    Optional<Connection> findBetween(@Param("a") Long a, @Param("b") Long b);

    // All accepted connections of a user
    @Query("""
        SELECT c FROM Connection c
        WHERE (c.requester.id = :userId OR c.addressee.id = :userId)
        AND c.status = 'ACCEPTED'
        """)
    List<Connection> findAcceptedByUser(@Param("userId") Long userId);

    // Pending requests addressed TO a user
    List<Connection> findByAddresseeIdAndStatus(Long addresseeId, ConnectionStatus status);

    // Pending requests sent BY a user
    List<Connection> findByRequesterIdAndStatus(Long requesterId, ConnectionStatus status);

    // IDs of accepted connections for a user
    @Query("""
        SELECT CASE WHEN c.requester.id = :userId THEN c.addressee.id ELSE c.requester.id END
        FROM Connection c
        WHERE (c.requester.id = :userId OR c.addressee.id = :userId)
        AND c.status = 'ACCEPTED'
        """)
    List<Long> findAcceptedConnectionIds(@Param("userId") Long userId);
}
