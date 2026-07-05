package com.quizmaster.service;

import com.quizmaster.dto.CategoryRequest;
import com.quizmaster.dto.CategoryResponse;
import com.quizmaster.dto.CategorySummaryDto;
import com.quizmaster.dto.QuizSummaryDto;
import com.quizmaster.entity.Category;
import com.quizmaster.entity.Quiz;
import com.quizmaster.entity.QuizStatus;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.CategoryRepository;
import com.quizmaster.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new IllegalStateException("Category with name '" + request.getName() + "' already exists");
        }
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIsActive(true);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new IllegalStateException("Category with name '" + request.getName() + "' already exists");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setUpdatedAt(LocalDateTime.now());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    /**
     * categories.id has no ON DELETE CASCADE/SET NULL from quizzes.category_id
     * (by design — see Database_Design_Document_v1). Deleting a category that
     * still has quizzes assigned throws DataIntegrityViolationException at the
     * DB layer; we translate that into a business-readable message instead of
     * letting it surface as a raw 500.
     */
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        try {
            categoryRepository.delete(category);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException(
                    "Cannot delete this category because quizzes are assigned to it. Reassign or remove those quizzes first.");
        }
    }

    /**
     * Category navigation: returns the category's identity plus every
     * PUBLISHED quiz under it. Draft/archived quizzes are excluded by
     * the repository query itself, not filtered in memory.
     */
    public CategorySummaryDto getCategoryQuizzes(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        List<QuizSummaryDto> quizzes = quizRepository
                .findByCategoryIdAndStatus(categoryId, QuizStatus.PUBLISHED)
                .stream()
                .map(this::mapToQuizSummary)
                .collect(Collectors.toList());

        return new CategorySummaryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                quizzes
        );
    }

    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIsActive()
        );
    }

    private QuizSummaryDto mapToQuizSummary(Quiz quiz) {
        return new QuizSummaryDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getDifficulty().name(),
                quiz.getDurationMinutes(),
                quiz.getTotalQuestions()
        );
    }
}