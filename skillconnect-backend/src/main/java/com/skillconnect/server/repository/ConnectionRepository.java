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

    // All accepted connections of a user (JOIN FETCH avoids lazy-load outside session)
    @Query("""
        SELECT c FROM Connection c
        JOIN FETCH c.requester r
        JOIN FETCH c.addressee a
        LEFT JOIN FETCH r.avatar
        LEFT JOIN FETCH a.avatar
        WHERE (c.requester.id = :userId OR c.addressee.id = :userId)
        AND c.status = 'ACCEPTED'
        """)
    List<Connection> findAcceptedByUser(@Param("userId") Long userId);

    // Pending requests addressed TO a user (JOIN FETCH to load users eagerly)
    @Query("""
        SELECT c FROM Connection c
        JOIN FETCH c.requester r
        JOIN FETCH c.addressee a
        LEFT JOIN FETCH r.avatar
        LEFT JOIN FETCH a.avatar
        WHERE c.addressee.id = :addresseeId AND c.status = :status
        """)
    List<Connection> findByAddresseeIdAndStatus(@Param("addresseeId") Long addresseeId,
                                                @Param("status") ConnectionStatus status);

    // Pending requests sent BY a user (JOIN FETCH to load users eagerly)
    @Query("""
        SELECT c FROM Connection c
        JOIN FETCH c.requester r
        JOIN FETCH c.addressee a
        LEFT JOIN FETCH r.avatar
        LEFT JOIN FETCH a.avatar
        WHERE c.requester.id = :requesterId AND c.status = :status
        """)
    List<Connection> findByRequesterIdAndStatus(@Param("requesterId") Long requesterId,
                                                @Param("status") ConnectionStatus status);

    // IDs of accepted connections for a user
    @Query("""
        SELECT CASE WHEN c.requester.id = :userId THEN c.addressee.id ELSE c.requester.id END
        FROM Connection c
        WHERE (c.requester.id = :userId OR c.addressee.id = :userId)
        AND c.status = com.skillconnect.server.entity.Connection.ConnectionStatus.ACCEPTED
        """)
    List<Long> findAcceptedConnectionIds(@Param("userId") Long userId);
}
