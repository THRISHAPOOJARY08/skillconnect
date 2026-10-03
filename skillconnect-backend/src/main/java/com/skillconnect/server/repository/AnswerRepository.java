package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    Optional<Answer> findByQuestionId(Long questionId);
    boolean existsByQuestionId(Long questionId);
    List<Answer> findByAnswererId(Long answererId);

    @Query("""
        SELECT a FROM Answer a
        JOIN a.question q
        WHERE a.answerer.id = :userId
        ORDER BY a.submittedAt DESC
        """)
    List<Answer> findByAnswererIdWithQuestion(@Param("userId") Long userId);
}
