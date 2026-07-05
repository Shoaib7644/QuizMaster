package com.quizmaster.controller;

import com.quizmaster.dto.DashboardResponse;
import com.quizmaster.entity.User;
import com.quizmaster.repository.UserRepository;
import com.quizmaster.service.DashboardService;
import com.quizmaster.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStudentDashboard() {
        Long userId = getCurrentUserId();
        DashboardResponse response = dashboardService.getStudentDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}