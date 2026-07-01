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
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    // Student: GET published quizzes
    // Admin: GET all quizzes
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getQuizzes() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        List<QuizResponse> quizzes;
        if (user.getRole().name().equals("ADMIN")) {
            quizzes = quizService.getQuizzesForAdmin();
        } else {
            quizzes = quizService.getQuizzesForStudent();
        }
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable("id") Long id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        QuizResponse quiz = quizService.getQuizById(id, isAdmin);
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
    public ResponseEntity<ApiResponse<Void>> uploadQuestions(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        quizService.uploadQuestions(id, file);
        return ResponseEntity.ok(ApiResponse.success(null, "Questions uploaded successfully"));
    }
}