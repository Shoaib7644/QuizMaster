package com.quizmaster.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AttemptSubmitRequest {
    @NotNull(message = "Attempt ID is required")
    private Long attemptId;

    @NotEmpty(message = "Answers list cannot be empty")
    private List<AnswerDto> answers;

    // Getters and Setters
    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public List<AnswerDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerDto> answers) {
        this.answers = answers;
    }
}