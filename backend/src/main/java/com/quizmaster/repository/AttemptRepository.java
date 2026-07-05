package com.quizmaster.repository;

import com.quizmaster.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUserId(Long userId);

    List<Attempt> findByQuizId(Long quizId);

    Optional<Attempt> findFirstByUserIdAndQuizIdOrderByCreatedAtDesc(Long userId, Long quizId);

    long countByUserIdAndSubmittedAtIsNotNull(Long userId);

    @Query("SELECT AVG(a.percentage) FROM Attempt a WHERE a.userId = :userId AND a.submittedAt IS NOT NULL")
    Double findAveragePercentageByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(a.percentage) FROM Attempt a WHERE a.userId = :userId AND a.submittedAt IS NOT NULL")
    BigDecimal findBestPercentageByUserId(@Param("userId") Long userId);

    List<Attempt> findTop5ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(Long userId);
}