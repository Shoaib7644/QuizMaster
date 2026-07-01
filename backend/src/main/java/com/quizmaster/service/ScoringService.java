package com.quizmaster.service;

import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.Attempt;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final AttemptRepository attemptRepository;

    public ResultResponse getResultById(Long attemptId, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
        if (!attempt.getUserId().equals(userId)) {
            throw new IllegalStateException("Attempt does not belong to user");
        }
        return mapToResultResponse(attempt);
    }

    private ResultResponse mapToResultResponse(Attempt attempt) {
        return new ResultResponse(
                attempt.getId(),
                attempt.getUserId(),
                attempt.getQuizId(),
                attempt.getScore(),
                attempt.getPercentage().doubleValue(),
                attempt.getTotalQuestions(),
                attempt.getCorrectAnswers(),
                attempt.getIncorrectAnswers(),
                attempt.getTotalPoints(),
                attempt.getStartedAt().toString(),
                attempt.getSubmittedAt().toString()
        );
    }
}