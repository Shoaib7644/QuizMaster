CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY','MEDIUM','HARD')),
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);