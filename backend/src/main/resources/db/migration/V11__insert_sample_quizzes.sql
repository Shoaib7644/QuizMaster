-- Insert categories if they don't exist
INSERT INTO categories (id, name, description, is_active, created_at, updated_at)
VALUES
    (1, 'Test Category', 'Test Description', TRUE, NOW(), NOW()),
    (2, 'Test Category for Quiz', 'For quiz test', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample published quizzes for student visibility

INSERT INTO quizzes (id, category_id, title, description, difficulty, duration_minutes, total_questions, status, created_by, created_at, updated_at)
VALUES
    (101, 1, 'Java Basics Quiz', 'Test your knowledge of core Java concepts', 'MEDIUM', 30, 2, 'PUBLISHED', 1, NOW(), NOW()),
    (102, 2, 'Spring Fundamentals', 'Learn the basics of Spring Framework', 'EASY', 20, 2, 'PUBLISHED', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert questions for Java Basics Quiz (quiz_id = 101)
INSERT INTO questions (id, quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, created_at, updated_at)
VALUES
    (1001, 101, 'What is the default value of an int in Java?', 'MCQ', '0', '1', 'null', '-1', 'A', NOW(), NOW()),
    (1002, 101, 'Which keyword is used to inherit a class in Java?', 'MCQ', 'extends', 'implements', 'inherits', 'super', 'A', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert questions for Spring Fundamentals (quiz_id = 102)
INSERT INTO questions (id, quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, created_at, updated_at)
VALUES
    (2001, 102, 'Which annotation is used to mark a class as a Spring Bean?', 'MCQ', '@Component', '@Service', '@Repository', '@Autowired', 'A', NOW(), NOW()),
    (2002, 102, 'What does Spring Boot''s @SpringBootApplication annotation combine?', 'MCQ', '@Configuration, @EnableAutoConfiguration, @ComponentScan', '@Configuration, @EnableWebMvc, @ComponentScan', '@Configuration, @EnableTransactionManagement, @ComponentScan', '@Configuration, @EnableJpaRepositories, @ComponentScan', 'A', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;