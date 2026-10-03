package com.skillconnect.server.repository;

import com.skillconnect.server.entity.TopicScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TopicScoreRepository extends JpaRepository<TopicScore, Long> {
    List<TopicScore> findByUserId(Long userId);
    Optional<TopicScore> findByUserIdAndTopicId(Long userId, Long topicId);
}
