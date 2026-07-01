package com.quizmaster.service;

import com.quizmaster.dto.CategoryRequest;
import com.quizmaster.dto.CategoryResponse;
import com.quizmaster.entity.Category;
import com.quizmaster.exception.ResourceNotFoundException;
import com.quizmaster.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

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
        category.setCreatedAt(java.time.LocalDateTime.now());
        category.setUpdatedAt(java.time.LocalDateTime.now());
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
        category.setUpdatedAt(java.time.LocalDateTime.now());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIsActive()
        );
    }
}