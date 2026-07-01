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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    public List<QuizResponse> getQuizzesForStudent() {
        // Only published quizzes
        return quizRepository.findByStatus(QuizStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getQuizzesForAdmin() {
        // All quizzes
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
        // Validate category exists
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with id: " + request.getCategoryId());
        }
        Quiz quiz = new Quiz();
        quiz.setCategoryId(request.getCategoryId());
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(stringToDifficulty(request.getDifficulty()));
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setTotalQuestions(request.getTotalQuestions());
        quiz.setStatus(QuizStatus.DRAFT); // default to draft
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedAt(java.time.LocalDateTime.now());
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        // Validate category if changed
        if (!request.getCategoryId().equals(quiz.getCategoryId()) && !categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with id: " + request.getCategoryId());
        }
        quiz.setCategoryId(request.getCategoryId());
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(stringToDifficulty(request.getDifficulty()));
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setTotalQuestions(request.getTotalQuestions());
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        quiz.setStatus(QuizStatus.PUBLISHED);
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse archiveQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        quiz.setStatus(QuizStatus.ARCHIVED);
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public void uploadQuestions(Long quizId, MultipartFile file) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        if (!quiz.getStatus().equals(QuizStatus.DRAFT)) {
            throw new IllegalStateException("Questions can only be uploaded for quizzes in DRAFT status");
        }

        List<Question> questions = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // skip header
                }
                String[] values = line.split(",", -1); // -1 to keep trailing empty strings
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

                // Validate
                if (questionText.isEmpty()) {
                    throw new IllegalStateException("Question text is required");
                }
                if (optionA.isEmpty() || optionB.isEmpty() || optionC.isEmpty() || optionD.isEmpty()) {
                    throw new IllegalStateException("All options A, B, C, D are required");
                }
                if (!correctAnswer.matches("[A-D]") && !questionTypeStr.equals(QuestionType.TRUE_FALSE.name())) {
                    // For MCQ, correct answer must be A-D; for TRUE_FALSE, must be TRUE or FALSE
                    if (questionTypeStr.equals(QuestionType.MCQ.name()) && !correctAnswer.matches("[A-D]")) {
                        throw new IllegalStateException("For MCQ, correct answer must be A, B, C, or D");
                    }
                    if (questionTypeStr.equals(QuestionType.TRUE_FALSE.name()) && !correctAnswer.matches("(TRUE|FALSE)")) {
                        throw new IllegalStateException("For TRUE_FALSE, correct answer must be TRUE or FALSE");
                    }
                }
                QuestionType questionType = stringToQuestionType(questionTypeStr);

                Question question = new Question();
                question.setQuizId(quizId);
                question.setQuestionText(questionText);
                question.setOptionA(optionA);
                question.setOptionB(optionB);
                question.setOptionC(optionC);
                question.setOptionD(optionD);
                question.setCorrectAnswer(correctAnswer);
                question.setQuestionType(questionType);
                question.setCreatedAt(java.time.LocalDateTime.now());
                question.setUpdatedAt(java.time.LocalDateTime.now());
                questions.add(question);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }

        if (questions.isEmpty()) {
            throw new IllegalStateException("No valid questions found in CSV");
        }

        // Save questions
        questionRepository.saveAll(questions);

        // Update quiz total_questions
        quiz.setTotalQuestions(questions.size());
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        quizRepository.save(quiz);
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
                quiz.getTotalQuestions(),
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