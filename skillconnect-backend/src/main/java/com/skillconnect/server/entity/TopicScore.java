package com.skillconnect.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "topic_scores",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","topic_id"}))
@Data
@NoArgsConstructor
public class TopicScore {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "earned_points", nullable = false)
    private int earnedPoints = 0;

    @Column(name = "max_points", nullable = false)
    private int maxPoints = 0;
}
