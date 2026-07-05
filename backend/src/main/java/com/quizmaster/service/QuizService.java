package com.quizmaster.service;

import com.quizmaster.dto.QuizRequest;
import com.quizmaster.dto.QuizResponse;
import com.quizmaster.dto.QuestionDto;
import com.quizmaster.entity.Question;
import com.quizmaster.entity.QuestionType;
import com.quizmaster.entity.Quiz;
import com.quizmaster.entity.QuizStatus;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.QuizRepository;
import com.quizmaster.repository.CategoryRepository;
import com.quizmaster.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    public List<QuizResponse> getQuizzesForStudent() {
        return quizRepository.findByStatus(QuizStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getQuizzesForAdmin() {
        return quizRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id, boolean forAdmin) {
        Quiz quiz;
        if (forAdmin) {
            quiz = quizRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        } else {
            quiz = quizRepository.findByIdAndStatus(id, QuizStatus.PUBLISHED)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found or not published with id: " + id));
        }
        return mapToResponse(quiz);
    }

    public QuizResponse createQuiz(QuizRequest request, Long createdBy) {
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with id: " + request.getCategoryId());
        }
        Quiz quiz = new Quiz();
        quiz.setCategoryId(request.getCategoryId());
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(stringToDifficulty(request.getDifficulty()));
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setTotalQuestions(0);
        quiz.setStatus(QuizStatus.DRAFT);
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        if (!request.getCategoryId().equals(quiz.getCategoryId()) && !categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with id: " + request.getCategoryId());
        }
        quiz.setCategoryId(request.getCategoryId());
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(stringToDifficulty(request.getDifficulty()));
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        if (questions.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot publish a quiz with no questions. Upload questions first.");
        }
        quiz.setStatus(QuizStatus.PUBLISHED);
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse archiveQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        quiz.setStatus(QuizStatus.ARCHIVED);
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        try {
            quizRepository.delete(quiz);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException(
                    "Cannot delete this quiz because students have already attempted it. Archive it instead to remove it from view.");
        }
    }

    public QuizResponse uploadQuestions(Long quizId, MultipartFile file) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        if (!quiz.getStatus().equals(QuizStatus.DRAFT)) {
            throw new IllegalStateException("Questions can only be uploaded for quizzes in DRAFT status");
        }

        List<Question> newQuestions = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                String[] values = line.split(",", -1);
                if (values.length < 7) {
                    throw new IllegalStateException("Invalid CSV format. Expected 7 columns, got " + values.length);
                }
                String questionText = values[0].trim();
                String optionA = values[1].trim();
                String optionB = values[2].trim();
                String optionC = values[3].trim();
                String optionD = values[4].trim();
                String correctAnswer = values[5].trim().toUpperCase();
                String questionTypeStr = values[6].trim().toUpperCase();

                if (questionText.isEmpty()) {
                    throw new IllegalStateException("Question text is required");
                }

                // Resolve the type FIRST — option-completeness rules differ by
                // type, so validating options before we know the type (the
                // previous bug) incorrectly forced TRUE_FALSE rows to supply
                // options C and D, which your documented CSV format explicitly
                // leaves blank for that type.
                QuestionType questionType = stringToQuestionType(questionTypeStr);

                if (questionType == QuestionType.MCQ) {
                    if (optionA.isEmpty() || optionB.isEmpty() || optionC.isEmpty() || optionD.isEmpty()) {
                        throw new IllegalStateException("All options A, B, C, D are required for MCQ questions");
                    }
                    if (!correctAnswer.matches("[A-D]")) {
                        throw new IllegalStateException("For MCQ, correct answer must be A, B, C, or D");
                    }
                } else { // TRUE_FALSE
                    if (optionA.isEmpty() || optionB.isEmpty()) {
                        throw new IllegalStateException("Options A and B (True/False) are required for True/False questions");
                    }
                    if (!correctAnswer.matches("(TRUE|FALSE)")) {
                        throw new IllegalStateException("For TRUE_FALSE, correct answer must be TRUE or FALSE");
                    }
                }

                Question question = new Question();
                question.setQuizId(quizId);
                question.setQuestionText(questionText);
                question.setOptionA(optionA);
                question.setOptionB(optionB);
                question.setOptionC(optionC);
                question.setOptionD(optionD);
                question.setCorrectAnswer(correctAnswer);
                question.setQuestionType(questionType);
                question.setCreatedAt(LocalDateTime.now());
                question.setUpdatedAt(LocalDateTime.now());
                newQuestions.add(question);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }

        if (newQuestions.isEmpty()) {
            throw new IllegalStateException("No valid questions found in CSV");
        }

        questionRepository.saveAll(newQuestions);

        int actualTotal = questionRepository.findByQuizId(quizId).size();
        quiz.setTotalQuestions(actualTotal);
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);

        return mapToResponse(quiz);
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        List<QuestionDto> questionDtos = questions.stream()
                .map(q -> {
                    List<String> opts = new ArrayList<>();
                    if (q.getQuestionType() == QuestionType.MCQ) {
                        opts.add(q.getOptionA());
                        opts.add(q.getOptionB());
                        opts.add(q.getOptionC());
                        opts.add(q.getOptionD());
                    } else {
                        opts.add("True");
                        opts.add("False");
                    }
                    return new QuestionDto(
                            q.getId(),
                            q.getQuestionText(),
                            q.getQuestionType().name(),
                            opts
                    );
                })
                .collect(Collectors.toList());

        return new QuizResponse(
                quiz.getId(),
                quiz.getCategoryId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getDifficulty().name(),
                quiz.getDurationMinutes(),
                questionDtos.size(),
                quiz.getStatus().name(),
                quiz.getCreatedBy(),
                questionDtos
        );
    }

    private com.quizmaster.entity.Difficulty stringToDifficulty(String difficultyStr) {
        return switch (difficultyStr.toUpperCase()) {
            case "EASY" -> com.quizmaster.entity.Difficulty.EASY;
            case "MEDIUM" -> com.quizmaster.entity.Difficulty.MEDIUM;
            case "HARD" -> com.quizmaster.entity.Difficulty.HARD;
            default -> throw new IllegalArgumentException("Invalid difficulty: " + difficultyStr);
        };
    }

    private QuestionType stringToQuestionType(String typeStr) {
        return switch (typeStr) {
            case "MCQ" -> QuestionType.MCQ;
            case "TRUE_FALSE" -> QuestionType.TRUE_FALSE;
            default -> throw new IllegalArgumentException("Invalid question type: " + typeStr);
        };
    }
}