package com.quizmaster.service;

import com.quizmaster.dto.AnswerDto;
import com.quizmaster.dto.AttemptResponse;
import com.quizmaster.dto.AttemptSubmitRequest;
import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.Attempt;
import com.quizmaster.entity.AttemptAnswer;
import com.quizmaster.entity.Category;
import com.quizmaster.entity.Question;
import com.quizmaster.entity.QuestionType;
import com.quizmaster.entity.Quiz;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.AttemptAnswerRepository;
import com.quizmaster.repository.AttemptRepository;
import com.quizmaster.repository.CategoryRepository;
import com.quizmaster.repository.QuestionRepository;
import com.quizmaster.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;

    public AttemptResponse startAttempt(Long userId, Long quizId) {
        Attempt attempt = new Attempt();
        attempt.setUserId(userId);
        attempt.setQuizId(quizId);
        LocalDateTime now = LocalDateTime.now();
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
        return new AttemptResponse(attempt.getId());
    }

    public ResultResponse submitAttempt(Long userId, Long attemptId, AttemptSubmitRequest submitRequest) {
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

        for (AnswerDto answerDto : submitRequest.getAnswers()) {
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
            attemptAnswer.setCreatedAt(LocalDateTime.now());
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
        attempt.setSubmittedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // Single attempt — a direct lookup here is fine, no N+1 risk.
        Quiz quiz = quizRepository.findById(attempt.getQuizId()).orElse(null);
        String quizTitle = quiz != null ? quiz.getTitle() : null;
        String categoryName = resolveCategoryName(quiz);

        return mapToResultResponse(attempt, quizTitle, categoryName);
    }

    /**
     * Batch-resolves quiz titles and category names for the whole history
     * list in two queries total, instead of one query per attempt row
     * (N+1). For a student with dozens of attempts this is the difference
     * between 2 queries and 40+.
     */
    public List<ResultResponse> getAttemptHistory(Long userId) {
        List<Attempt> attempts = attemptRepository.findByUserId(userId);
        if (attempts.isEmpty()) {
            return List.of();
        }

        Set<Long> quizIds = attempts.stream()
                .map(Attempt::getQuizId)
                .collect(Collectors.toSet());

        Map<Long, Quiz> quizById = quizRepository.findAllById(quizIds).stream()
                .collect(Collectors.toMap(Quiz::getId, Function.identity()));

        Set<Long> categoryIds = quizById.values().stream()
                .map(Quiz::getCategoryId)
                .collect(Collectors.toSet());

        Map<Long, Category> categoryById = categoryIds.isEmpty()
                ? Map.of()
                : categoryRepository.findAllById(categoryIds).stream()
                  .collect(Collectors.toMap(Category::getId, Function.identity()));

        return attempts.stream()
                .map(attempt -> {
                    Quiz quiz = quizById.get(attempt.getQuizId());
                    String quizTitle = quiz != null ? quiz.getTitle() : null;
                    String categoryName = quiz != null
                            ? categoryById.getOrDefault(quiz.getCategoryId(), null) != null
                              ? categoryById.get(quiz.getCategoryId()).getName()
                              : null
                            : null;
                    return mapToResultResponse(attempt, quizTitle, categoryName);
                })
                .toList();
    }

    private String resolveCategoryName(Quiz quiz) {
        if (quiz == null) {
            return null;
        }
        return categoryRepository.findById(quiz.getCategoryId())
                .map(Category::getName)
                .orElse(null);
    }

    private boolean checkAnswer(Question question, String selectedAnswer) {

        if (selectedAnswer == null || selectedAnswer.isBlank()) {
            return false;
        }

        String submitted = selectedAnswer.trim();
        String correct = question.getCorrectAnswer().trim();

        if (question.getQuestionType() == QuestionType.TRUE_FALSE) {
            return correct.equalsIgnoreCase(submitted);
        }

        // MCQ:
        // Database stores A/B/C/D
        // Frontend submits option text.
        // Convert correct option letter into its option text.

        String correctOptionText = switch (correct.toUpperCase()) {
            case "A" -> question.getOptionA();
            case "B" -> question.getOptionB();
            case "C" -> question.getOptionC();
            case "D" -> question.getOptionD();
            default -> correct;
        };

        return submitted.equalsIgnoreCase(correctOptionText);
    }

    private ResultResponse mapToResultResponse(Attempt attempt, String quizTitle, String categoryName) {
        return new ResultResponse(
                attempt.getId(),
                attempt.getUserId(),
                attempt.getQuizId(),
                quizTitle,
                categoryName,
                attempt.getScore(),
                attempt.getPercentage().doubleValue(),
                attempt.getTotalQuestions(),
                attempt.getCorrectAnswers(),
                attempt.getIncorrectAnswers(),
                attempt.getTotalPoints(),
                attempt.getStartedAt() != null ? attempt.getStartedAt().toString() : null,
                attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().toString() : null
        );
    }
}