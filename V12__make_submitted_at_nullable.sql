-- V12__make_submitted_at_nullable.sql
-- Corrects a schema/business-logic mismatch identified during debugging of
-- POST /api/attempts/submit (2026-07-01).
--
-- Root cause: attempts.submitted_at was originally defined NOT NULL
-- (see V5__create_attempts_table.sql / Database_Design_Document_v1.docx,
-- Section 3), which forced AttemptService.startAttempt() to stamp
-- submitted_at = startedAt at attempt-creation time purely to satisfy the
-- constraint. submitAttempt() uses "submittedAt != null" as its
-- already-submitted guard, so every first-time submission was incorrectly
-- rejected as a duplicate.
--
-- This migration relaxes the constraint so submitted_at can remain NULL
-- until the attempt is actually submitted, matching the entity annotation
-- in Attempt.java (nullable = true), which already assumed this lifecycle.

ALTER TABLE attempts
    ALTER COLUMN submitted_at DROP NOT NULL;