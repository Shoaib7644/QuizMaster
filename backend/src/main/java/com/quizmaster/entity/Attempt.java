package com.quizmaster.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "score", nullable = true)
    private Integer score;

    @Column(name = "percentage", nullable = true, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "total_questions", nullable = true)
    private Integer totalQuestions;

    @Column(name = "correct_answers", nullable = true)
    private Integer correctAnswers;

    @Column(name = "incorrect_answers", nullable = true)
    private Integer incorrectAnswers;

    @Column(name = "total_points", nullable = true)
    private Integer totalPoints;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at", nullable = true)
    private LocalDateTime submittedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}