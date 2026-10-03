package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByAnswerId(Long answerId);
    boolean existsByAnswerId(Long answerId);

    @Query("""
        SELECT COALESCE(SUM(e.awardedPoints), 0)
        FROM Evaluation e JOIN e.answer a
        WHERE a.answerer.id = :userId
        """)
    int sumPointsByAnswerer(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(e.awardedPoints), 0)
        FROM Evaluation e JOIN e.answer a
        WHERE a.answerer.id = :userId
        AND e.evaluatedAt >= :since
        """)
    int sumPointsByAnswererSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // Time series: date + sum of points for line chart
    @Query(value = """
        SELECT DATE(e.evaluated_at) as dt, SUM(e.awarded_points) as pts
        FROM evaluations e
        JOIN answers a ON a.id = e.answer_id
        WHERE a.answerer_id = :userId
        AND e.evaluated_at >= :since
        GROUP BY DATE(e.evaluated_at)
        ORDER BY dt
        """, nativeQuery = true)
    List<Object[]> timeSeries(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // Count evaluations given by a user (as evaluator)
    long countByEvaluatorId(Long evaluatorId);

    // Evaluations received by answerer
    @Query("""
        SELECT COUNT(e) FROM Evaluation e
        JOIN e.answer a WHERE a.answerer.id = :userId
        """)
    long countByAnswerer(@Param("userId") Long userId);
}
