CREATE TABLE attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id),
    selected_answer VARCHAR(10),
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);