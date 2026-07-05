package com.quizmaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResultResponse {
    private Long id;
    private Long userId;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private Integer score;
    private Double percentage;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer totalPoints;
    private String startedAt;
    private String submittedAt;
}