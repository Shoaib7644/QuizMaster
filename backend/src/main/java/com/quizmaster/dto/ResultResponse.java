package com.quizmaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResultResponse {
    private Long attemptId;
    private Long userId;
    private Long quizId;
    private Integer score;
    private Double percentage; // using double for simplicity
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer totalPoints;
    private String startedAt;
    private String submittedAt;
}