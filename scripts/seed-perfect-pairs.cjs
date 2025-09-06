// Seed hidden testcases for "Number of Perfect Pairs" into question_hidden_testcases
// Usage: node scripts/seed-perfect-pairs.cjs [count]

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

function countPerfectPairs(nums) {
  const arr = nums.map((x) => Math.abs(x)).sort((a, b) => a - b);
  let start = 0;
  let ans = 0;
  for (let i = 1; i < arr.length; i++) {
    const need = Math.ceil(arr[i] / 2);
    while (start < i && arr[start] < need) start++;
    ans += i - start;
  }
  return ans;
}

function generateCases(total = 10, maxN = 10000, maxVal = 1_000_000_000) {
  const cases = [];
  // Edge case: [0,0] -> 1 pair
  cases.push({ input: { nums: [0, 0] }, expected_output: 1 });

  // Mixed small cases
  const smallCount = Math.min(3, Math.max(0, total - 1));
  for (let k = 0; k < smallCount; k++) {
    const n = randInt(2, 20);
    const nums = Array.from({ length: n }, () => randInt(-1000, 1000));
    cases.push({ input: { nums }, expected_output: countPerfectPairs(nums) });
  }

  // Large random cases
  const remaining = Math.max(0, total - cases.length);
  for (let k = 0; k < remaining; k++) {
    const n = randInt(1000, Math.max(1000, maxN));
    const nums = Array.from({ length: n }, () => {
      const sign = Math.random() < 0.5 ? -1 : 1;
      return sign * randInt(0, maxVal);
    });
    cases.push({ input: { nums }, expected_output: countPerfectPairs(nums) });
  }
  return cases;
}

async function main() {
  const COUNT = Number(process.argv[2] || 10);
  console.log(`[PerfectPairs] Generating ${COUNT} hidden testcases...`);

  // Resolve question id by title to be robust
  const qRows = await sql`SELECT question_id FROM questions WHERE title = 'Number of Perfect Pairs' LIMIT 1`;
  if (!qRows.length) {
    console.error('Question "Number of Perfect Pairs" not found. Seed questions first.');
    process.exit(1);
  }
  const qid = Number(qRows[0].question_id);
  console.log('Number of Perfect Pairs question_id =', qid);

  const cases = generateCases(COUNT);

  // Clear existing to avoid duplication
  await sql`DELETE FROM question_hidden_testcases WHERE question_id = ${qid}`;

  // Insert
  for (const c of cases) {
    const input_text = JSON.stringify({ input: c.input });
    const expected_output = JSON.stringify(c.expected_output);
    await sql`
      INSERT INTO question_hidden_testcases (question_id, input_text, expected_output)
      VALUES (${qid}, ${input_text}, ${expected_output})
    `;
  }

  const cnt = await sql`SELECT COUNT(*)::int AS cnt FROM question_hidden_testcases WHERE question_id = ${qid}`;
  console.log(`✅ Inserted hidden tests. Total for question ${qid}:`, cnt[0].cnt);
}

main().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
