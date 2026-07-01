CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id),
    score INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);