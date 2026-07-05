package com.quizmaster.controller;

import com.quizmaster.dto.QuizRequest;
import com.quizmaster.dto.QuizResponse;
import com.quizmaster.entity.User;
import com.quizmaster.repository.UserRepository;
import com.quizmaster.service.QuizService;
import com.quizmaster.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    private boolean isCurrentUserAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getRole().name().equals("ADMIN");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getQuizzes() {
        List<QuizResponse> quizzes = isCurrentUserAdmin()
                ? quizService.getQuizzesForAdmin()
                : quizService.getQuizzesForStudent();
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable("id") Long id) {
        QuizResponse quiz = quizService.getQuizById(id, isCurrentUserAdmin());
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(@Valid @RequestBody QuizRequest request) {
        Long createdBy = getCurrentUserId();
        QuizResponse quiz = quizService.createQuiz(request, createdBy);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(@PathVariable("id") Long id, @Valid @RequestBody QuizRequest request) {
        QuizResponse quiz = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable("id") Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Quiz deleted successfully"));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> publishQuiz(@PathVariable("id") Long id) {
        QuizResponse quiz = quizService.publishQuiz(id);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz published successfully"));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> archiveQuiz(@PathVariable("id") Long id) {
        QuizResponse quiz = quizService.archiveQuiz(id);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz archived successfully"));
    }

    @PostMapping("/{id}/questions/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> uploadQuestions(
            @PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        QuizResponse quiz = quizService.uploadQuestions(id, file);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Questions uploaded successfully"));
    }
}