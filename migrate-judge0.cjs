// Migration for Judge0 integration: add time/memory limits and hidden testcases table
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function run() {
  const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
  if (!DB_URL) {
    console.error('Missing NEXT_PUBLIC_DRIZZLE_DB_URL in .env.local');
    process.exit(1);
  }
  const sql = neon(DB_URL);
  try {
    console.log('Starting Judge0 migration...');

    // Add limits to questions
    console.log('Adding time_limit_sec and memory_limit_kb to questions (if not exists)...');
    await sql`
      ALTER TABLE questions
      ADD COLUMN IF NOT EXISTS time_limit_sec INT NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS memory_limit_kb INT NOT NULL DEFAULT 256000
    `;

    console.log('Ensuring defaults on existing rows...');
    await sql`UPDATE questions SET time_limit_sec = 1 WHERE time_limit_sec IS NULL`;
    await sql`UPDATE questions SET memory_limit_kb = 256000 WHERE memory_limit_kb IS NULL`;

    // Create hidden testcases table
    console.log('Creating question_hidden_testcases table (if not exists)...');
    await sql`
      CREATE TABLE IF NOT EXISTS question_hidden_testcases (
        testcase_id SERIAL PRIMARY KEY,
        question_id INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
        input_text TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Judge0 migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
