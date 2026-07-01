package com.quizmaster.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto {
    private Long id;
    private String text;
    private String type; // MCQ, TRUE_FALSE
    private List<String> options; // for MCQ: A,B,C,D; for TRUE_FALSE: True,False
}