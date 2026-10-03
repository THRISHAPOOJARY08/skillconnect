package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Question;
import com.skillconnect.server.entity.Question.QuestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCreatorId(Long creatorId);

    // Questions assigned to a specific recipient
    @Query("""
        SELECT q FROM Question q JOIN q.recipients r
        WHERE r.id = :userId
        ORDER BY q.createdAt DESC
        """)
    List<Question> findByRecipientId(@Param("userId") Long userId);

    // Questions for a group
    List<Question> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    // Search questions by title/description
    @Query("""
        SELECT q FROM Question q
        WHERE LOWER(q.title) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(q.description) LIKE LOWER(CONCAT('%',:q,'%'))
        ORDER BY q.createdAt DESC
        """)
    List<Question> searchQuestions(@Param("q") String q);

    long countByCreatorId(Long creatorId);

    @Query("""
        SELECT COUNT(DISTINCT a.question.id)
        FROM Answer a WHERE a.answerer.id = :userId
        """)
    long countAnsweredByUser(@Param("userId") Long userId);
}
