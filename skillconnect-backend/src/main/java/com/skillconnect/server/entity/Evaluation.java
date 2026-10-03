package com.skillconnect.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
public class Evaluation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // UNIQUE constraint prevents double evaluation
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private Answer answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    @Column(name = "awarded_points", nullable = false)
    private int awardedPoints;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "evaluated_at", nullable = false, updatable = false)
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() { if (evaluatedAt == null) evaluatedAt = LocalDateTime.now(); }
}
