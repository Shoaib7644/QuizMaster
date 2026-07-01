package com.quizmaster.service;

import com.quizmaster.dto.AnswerDto;
import com.quizmaster.dto.AttemptSubmitRequest;
import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.Attempt;
import com.quizmaster.entity.AttemptAnswer;
import com.quizmaster.entity.Question;
import com.quizmaster.entity.QuestionType;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.AttemptAnswerRepository;
import com.quizmaster.repository.AttemptRepository;
import com.quizmaster.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    public com.quizmaster.dto.AttemptResponse startAttempt(Long userId, Long quizId) {
        Attempt attempt = new Attempt();
        attempt.setUserId(userId);
        attempt.setQuizId(quizId);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        attempt.setStartedAt(now);
        attempt.setCreatedAt(now);
        // submittedAt intentionally left null here — it is set only when
        // submitAttempt() runs. See V2__make_submitted_at_nullable.sql.
        attempt.setScore(0);
        attempt.setPercentage(BigDecimal.ZERO);
        attempt.setTotalQuestions(0);
        attempt.setCorrectAnswers(0);
        attempt.setIncorrectAnswers(0);
        attempt.setTotalPoints(0);
        attemptRepository.save(attempt);
        return new com.quizmaster.dto.AttemptResponse(attempt.getId());
    }

    public ResultResponse submitAttempt(Long userId, Long attemptId, com.quizmaster.dto.AttemptSubmitRequest submitRequest) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
        if (!attempt.getUserId().equals(userId)) {
            throw new IllegalStateException("Attempt does not belong to user");
        }
        if (attempt.getSubmittedAt() != null) {
            throw new IllegalStateException("Attempt already submitted");
        }

        if (!attemptId.equals(submitRequest.getAttemptId())) {
            throw new IllegalStateException("Attempt ID mismatch");
        }

        List<Question> questions = questionRepository.findByQuizId(attempt.getQuizId());
        if (questions.isEmpty()) {
            throw new IllegalStateException("No questions found for quiz");
        }

        int correctAnswers = 0;
        int totalQuestions = questions.size();

        attemptAnswerRepository.deleteByAttemptId(attemptId);

        List<AttemptAnswer> attemptAnswers = new ArrayList<>();

        for (com.quizmaster.dto.AnswerDto answerDto : submitRequest.getAnswers()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(answerDto.getQuestionId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + answerDto.getQuestionId()));

            boolean isCorrect = checkAnswer(question, answerDto.getSelectedAnswer());
            if (isCorrect) {
                correctAnswers++;
            }

            AttemptAnswer attemptAnswer = new AttemptAnswer();
            attemptAnswer.setAttemptId(attemptId);
            attemptAnswer.setQuestionId(question.getId());
            attemptAnswer.setSelectedAnswer(answerDto.getSelectedAnswer());
            attemptAnswer.setIsCorrect(isCorrect);
            attemptAnswer.setCreatedAt(java.time.LocalDateTime.now());
            attemptAnswers.add(attemptAnswer);
        }

        attemptAnswerRepository.saveAll(attemptAnswers);

        int score = correctAnswers;
        double percentage = ((double) correctAnswers / totalQuestions) * 100;
        int totalPoints = score;

        attempt.setScore(score);
        attempt.setPercentage(BigDecimal.valueOf(percentage));
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setIncorrectAnswers(totalQuestions - correctAnswers);
        attempt.setTotalPoints(totalPoints);
        attempt.setSubmittedAt(java.time.LocalDateTime.now());
        attemptRepository.save(attempt);

        return mapToResultResponse(attempt);
    }

    public List<ResultResponse> getAttemptHistory(Long userId) {
        List<Attempt> attempts = attemptRepository.findByUserId(userId);
        return attempts.stream()
                .map(this::mapToResultResponse)
                .toList();
    }

    private boolean checkAnswer(Question question, String selectedAnswer) {
        String correctAnswer = question.getCorrectAnswer();
        if (question.getQuestionType() == QuestionType.TRUE_FALSE) {
            return correctAnswer.equalsIgnoreCase(selectedAnswer);
        } else {
            return correctAnswer.equalsIgnoreCase(selectedAnswer);
        }
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