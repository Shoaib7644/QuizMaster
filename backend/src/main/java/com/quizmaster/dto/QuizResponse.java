package com.quizmaster.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResponse {
    private Long id;
    private Long categoryId;
    private String title;
    private String description;
    private String difficulty;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private String status;
    private Long createdBy;
    private List<QuestionDto> questions;
}