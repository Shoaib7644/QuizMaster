CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_quizzes_category ON quizzes(category_id);
CREATE INDEX idx_attempt_user ON attempts(user_id);
CREATE INDEX idx_attempt_quiz ON attempts(quiz_id);
CREATE INDEX idx_notification_user ON notifications(user_id);