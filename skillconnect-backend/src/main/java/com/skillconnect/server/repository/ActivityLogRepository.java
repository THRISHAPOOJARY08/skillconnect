package com.skillconnect.server.repository;

import com.skillconnect.server.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByAnswerIdOrderByEventTimestampAsc(Long answerId);
}
