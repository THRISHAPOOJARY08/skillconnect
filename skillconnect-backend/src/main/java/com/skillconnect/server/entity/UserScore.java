package com.skillconnect.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_scores")
@Data
@NoArgsConstructor
public class UserScore {
    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "total_points", nullable = false)
    private int totalPoints = 0;

    @Column(name = "total_answers", nullable = false)
    private int totalAnswers = 0;

    @Column(name = "total_evaluated", nullable = false)
    private int totalEvaluated = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
