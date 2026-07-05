package com.quizmaster.service;

import com.quizmaster.dto.DashboardResponse;
import com.quizmaster.dto.DashboardStatsDto;
import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.Attempt;
import com.quizmaster.repository.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AttemptRepository attemptRepository;

    public DashboardResponse getStudentDashboard(Long userId) {
        long completedQuizCount = attemptRepository.countByUserIdAndSubmittedAtIsNotNull(userId);

        Double averagePercentage = attemptRepository.findAveragePercentageByUserId(userId);
        BigDecimal bestPercentage = attemptRepository.findBestPercentageByUserId(userId);

        double averageScore = roundToTwoDecimals(averagePercentage);
        double bestScore = bestPercentage != null ? roundToTwoDecimals(bestPercentage.doubleValue()) : 0.0;

        DashboardStatsDto stats = new DashboardStatsDto(completedQuizCount, averageScore, bestScore);

        List<Attempt> recentAttempts =
                attemptRepository.findTop5ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(userId);

        List<ResultResponse> recentResults = recentAttempts.stream()
                .map(this::mapToResultResponse)
                .toList();

        return new DashboardResponse(stats, recentResults);
    }

    private double roundToTwoDecimals(Double value) {
        if (value == null) {
            return 0.0;
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private ResultResponse mapToResultResponse(Attempt attempt) {
        return new ResultResponse(
                attempt.getId(),
                attempt.getUserId(),
                attempt.getQuizId(),
                null, // quizTitle
                null, // categoryName
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