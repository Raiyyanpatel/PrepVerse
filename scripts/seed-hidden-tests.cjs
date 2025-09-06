// Seed hidden testcases for "Two Sum" into question_hidden_testcases
// Usage: node scripts/seed-hidden-tests.cjs [count]

const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
if (!DB_URL) {
  console.error('Missing NEXT_PUBLIC_DRIZZLE_DB_URL in .env.local');
  process.exit(1);
}

const sql = neon(DB_URL);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTwoSumCases(numCases = 5) {
  const cases = [];
  for (let _ = 0; _ < numCases; _++) {
    const n = randInt(2, 1000);
    const nums = Array.from({ length: n }, () => randInt(-10000, 10000));
    // pick two distinct indices
    let i = 0, j = 0;
    while (i === j) {
      i = randInt(0, n - 1);
      j = randInt(0, n - 1);
    }
    const target = nums[i] + nums[j];
    const output = i < j ? [i, j] : [j, i];
    cases.push({ input: { nums, target }, expected_output: output });
  }
  return cases;
}

(async () => {
  try {
    const COUNT = Number(process.argv[2]) || 5;
    console.log(`Seeding ${COUNT} hidden testcases for "Two Sum"...`);

    // Lookup question_id by title
    const rows = await sql`SELECT question_id FROM questions WHERE title = 'Two Sum' LIMIT 1`;
    if (!rows.length) {
      console.error('Question "Two Sum" not found. Seed questions first.');
      process.exit(1);
    }
    const qid = rows[0].question_id;
    console.log('Two Sum question_id =', qid);

    // Optionally clear existing hidden tests to avoid duplication
    await sql`DELETE FROM question_hidden_testcases WHERE question_id = ${qid}`;

    const cases = generateTwoSumCases(COUNT);

    // Batch insert
    for (const c of cases) {
      const input_text = JSON.stringify(c.input);
      const expected_output = JSON.stringify(c.expected_output);
      await sql`
        INSERT INTO question_hidden_testcases (question_id, input_text, expected_output)
        VALUES (${qid}, ${input_text}, ${expected_output})
      `;
    }

    const inserted = await sql`SELECT COUNT(*)::int AS cnt FROM question_hidden_testcases WHERE question_id = ${qid}`;
    console.log(`✅ Inserted hidden tests. Total for question ${qid}:`, inserted[0].cnt);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
