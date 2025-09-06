-- Migration: Add time/memory limits to questions and create hidden testcases table

-- Add time and memory limit columns to existing questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS time_limit_sec INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS memory_limit_kb INT NOT NULL DEFAULT 256000;

-- Optional: ensure existing rows have the intended defaults
UPDATE questions SET time_limit_sec = 1 WHERE time_limit_sec IS NULL;
UPDATE questions SET memory_limit_kb = 256000 WHERE memory_limit_kb IS NULL;

-- Create table for hidden testcases linked to questions
CREATE TABLE IF NOT EXISTS question_hidden_testcases (
  testcase_id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
