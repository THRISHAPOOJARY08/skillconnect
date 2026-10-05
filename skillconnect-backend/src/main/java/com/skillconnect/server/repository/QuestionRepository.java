package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Question;
import com.skillconnect.server.entity.Question.QuestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCreatorId(Long creatorId);

    // Eager fetch variant for service layer (avoids LazyInitializationException)
    @Query("""
        SELECT DISTINCT q FROM Question q
        LEFT JOIN FETCH q.recipients r
        LEFT JOIN FETCH q.creator c
        LEFT JOIN FETCH c.avatar
        LEFT JOIN FETCH q.topic
        WHERE q.creator.id = :creatorId
        ORDER BY q.createdAt DESC
        """)
    List<Question> findByCreatorIdFetch(@Param("creatorId") Long creatorId);

    // Questions assigned to a specific recipient
    @Query("""
        SELECT q FROM Question q JOIN q.recipients r
        WHERE r.id = :userId
        ORDER BY q.createdAt DESC
        """)
    List<Question> findByRecipientId(@Param("userId") Long userId);

    // Eager fetch variant for recipient
    @Query("""
        SELECT DISTINCT q FROM Question q
        JOIN q.recipients rec
        LEFT JOIN FETCH q.recipients r
        LEFT JOIN FETCH q.creator c
        LEFT JOIN FETCH c.avatar
        LEFT JOIN FETCH q.topic
        WHERE rec.id = :userId
        ORDER BY q.createdAt DESC
        """)
    List<Question> findByRecipientIdFetch(@Param("userId") Long userId);

    // Single question with all associations loaded
    @Query("""
        SELECT q FROM Question q
        LEFT JOIN FETCH q.recipients r
        LEFT JOIN FETCH q.creator c
        LEFT JOIN FETCH c.avatar
        LEFT JOIN FETCH q.topic
        WHERE q.id = :id
        """)
    Optional<Question> findByIdFetch(@Param("id") Long id);

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
