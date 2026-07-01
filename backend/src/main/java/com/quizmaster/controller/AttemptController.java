package com.quizmaster.controller;

import com.quizmaster.dto.AnswerDto;
import com.quizmaster.dto.AttemptStartRequest;
import com.quizmaster.dto.AttemptSubmitRequest;
import com.quizmaster.dto.AttemptResponse;
import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.User;
import com.quizmaster.repository.UserRepository;
import com.quizmaster.service.AttemptService;
import com.quizmaster.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<AttemptResponse>> startAttempt(@Valid @RequestBody AttemptStartRequest request) {
        Long userId = getCurrentUserId();
        AttemptResponse response = attemptService.startAttempt(userId, request.getQuizId());
        return ResponseEntity.ok(ApiResponse.success(response, "Attempt started"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ResultResponse>> submitAttempt(@Valid @RequestBody AttemptSubmitRequest request) {
        System.out.println("=== INCOMING SUBMIT PAYLOAD ===");
        System.out.println(request.toString());
        Long userId = getCurrentUserId();
        ResultResponse result = attemptService.submitAttempt(userId, request.getAttemptId(), request);
        return ResponseEntity.ok(ApiResponse.success(result, "Attempt submitted"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getAttemptHistory() {
        Long userId = getCurrentUserId();
        List<ResultResponse> history = attemptService.getAttemptHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}