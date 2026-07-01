package com.quizmaster.repository;

import com.quizmaster.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByUserId(Long userId);
    List<Attempt> findByQuizId(Long quizId);
    Optional<Attempt> findFirstByUserIdAndQuizIdOrderByCreatedAtDesc(Long userId, Long quizId);
}