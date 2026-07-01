package com.quizmaster.controller;

import com.quizmaster.dto.ResultResponse;
import com.quizmaster.entity.User;
import com.quizmaster.repository.UserRepository;
import com.quizmaster.service.ScoringService;
import com.quizmaster.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ScoringController {

    private final ScoringService scoringService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ApiResponse<ResultResponse>> getResult(@PathVariable("attemptId") Long attemptId) {
        Long userId = getCurrentUserId();
        ResultResponse result = scoringService.getResultById(attemptId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}