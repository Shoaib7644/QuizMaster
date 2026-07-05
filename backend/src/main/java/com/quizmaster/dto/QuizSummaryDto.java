package com.quizmaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizSummaryDto {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private Integer durationMinutes;
    private Integer totalQuestions;
}