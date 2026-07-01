package com.quizmaster.repository;

import com.quizmaster.entity.Quiz;
import com.quizmaster.entity.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCategoryId(Long categoryId);
    List<Quiz> findByStatus(QuizStatus status);
    List<Quiz> findByCreatedBy(Long createdBy);
    Optional<Quiz> findByIdAndStatus(Long id, QuizStatus status);
}