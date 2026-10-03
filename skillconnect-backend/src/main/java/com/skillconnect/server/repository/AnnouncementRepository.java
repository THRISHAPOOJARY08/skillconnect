package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * Fetch all announcements visible to a user:
     *   - announcements they sent
     *   - broadcasts sent by any of their connections
     *   - private announcements addressed specifically to them
     */
    @Query("""
        SELECT a FROM Announcement a
        WHERE a.sender.id = :userId
           OR (a.recipient IS NULL  AND a.sender.id IN :connectionIds)
           OR (a.recipient.id = :userId)
        ORDER BY a.createdAt DESC
        """)
    List<Announcement> findVisibleTo(
            @Param("userId") Long userId,
            @Param("connectionIds") List<Long> connectionIds);
}
