// Create 'questions' table and seed initial rows in Neon (PostgreSQL)
// Usage: node scripts/create-questions.js

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL || 'postgresql://neondb_owner:npg_8JViqmlxZh7w@ep-red-union-a19uagoj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DB_URL);

async function main() {
  console.log('Connecting to Neon...');

  // 1) Ensure enum type exists (use DO block for compatibility)
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('Easy','Medium','Hard');
      END IF;
    END$$;
  `;

  // 2) Create table (PostgreSQL version of the requested schema)
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      question_id BIGSERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      difficulty difficulty_level,
      "constraints" TEXT,
      example_input TEXT,
      example_output TEXT
    )
  `;

  // 2b) Ensure a unique constraint on title for idempotent inserts
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'questions_title_unique'
      ) THEN
        ALTER TABLE questions ADD CONSTRAINT questions_title_unique UNIQUE (title);
      END IF;
    END$$;
  `;

  // 3) Insert rows if they don't already exist (by title)
  const row1 = {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
    difficulty: 'Easy',
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9`,
    example_input: 'nums = [2,7,11,15], target = 9',
    example_output: '[0,1]'
  };

  const row2 = {
    title: 'Number of Perfect Pairs',
    description: `You are given an array nums of integers. A pair (i, j) is called a perfect pair if:
Let a = nums[i] and b = nums[j]. Then:
min(|a - b|, |a + b|) <= min(|a|, |b|) 
AND 
max(|a - b|, |a + b|) >= max(|a|, |b|).
Return the total number of perfect pairs (i, j) such that 0 <= i < j < nums.length.`,
    difficulty: 'Medium',
    constraints: `1 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9`,
    example_input: 'nums = [2,3,4]',
    example_output: '3'
  };

  for (const r of [row1, row2]) {
    await sql`
      INSERT INTO questions (title, description, difficulty, "constraints", example_input, example_output)
      VALUES (${r.title}, ${r.description}, ${r.difficulty}::difficulty_level, ${r.constraints}, ${r.example_input}, ${r.example_output})
      ON CONFLICT (title) DO NOTHING
    `;
  }

  const rows = await sql`SELECT question_id, title, difficulty FROM questions ORDER BY question_id ASC LIMIT 10`;
  console.table(rows);
  console.log('✅ Questions table ready and seeded.');
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
