package com.skillconnect.server.repository;

import com.skillconnect.server.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    List<UserActivity> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
