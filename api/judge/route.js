import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

// RapidAPI Judge0 configuration
const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || `https://${process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'}`;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_JUDGE0 || process.env.RAPIDAPI_KEY || '';

// Map our UI languages to Judge0 language IDs (common defaults; adjust if needed)
const LANGUAGE_ID_MAP = {
  c: 50,          // C (GCC 9.x)
  cpp: 54,        // C++ (G++ 9.x)
  java: 62,       // Java (OpenJDK 13)
  javascript: 63, // JavaScript (Node.js 12)
  python: 71      // Python 3.8
};

function mapStatusToVerdict(status) {
  const id = Number(status?.id || 0);
  const name = String(status?.description || status?.name || '').toLowerCase();
  if (id === 3 || name.includes('accepted')) return 'Accepted';
  if (id === 4 || name.includes('wrong')) return 'Wrong Answer';
  if (id === 5 || name.includes('time')) return 'TLE';
  if (id === 6 || name.includes('compil')) return 'Compilation Error';
  if (name.includes('memory')) return 'Memory Limit Exceeded';
  if (id === 7 || name.includes('runtime') || name.includes('error') || name.includes('exception')) return 'Runtime Error';
  return 'Runtime Error';
}

async function judgeTestCase({ languageId, sourceCode, stdin, expectedOutput, timeLimitSec, memoryLimitKb }) {
  const url = `${JUDGE0_BASE_URL}/submissions?wait=true`;
  const payload = {
    language_id: languageId,
    source_code: sourceCode,
    stdin: stdin ?? '',
    expected_output: expectedOutput ?? '',
  cpu_time_limit: timeLimitSec ?? 1,
  cpu_extra_time: 0.5,
  wall_time_limit: (timeLimitSec ?? 1) + 2,
    memory_limit: memoryLimitKb ?? 256000,
    redirect_stderr_to_stdout: true
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': new URL(JUDGE0_BASE_URL).host
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Judge0 ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data;
}

export async function POST(req) {
  try {
    // Validate inputs
    const body = await req.json();
    let { questionId, language, code, id: altId, qid, title } = body || {};
    // Debug log of body keys for troubleshooting
    try {
      const keys = Object.keys(body || {});
      console.log(`[JUDGE0] Incoming body keys: ${keys.join(', ')}`);
    } catch {}

    // Resolve questionId from alternates if missing
    if (!Number.isFinite(Number(questionId))) {
      if (Number.isFinite(Number(altId))) questionId = Number(altId);
      else if (Number.isFinite(Number(qid))) questionId = Number(qid);
    }

  // As a last resort, resolve by title
  const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
  if (!DB_URL) return NextResponse.json({ error: 'Missing DB URL' }, { status: 500 });
  const sql = neon(DB_URL);
    if (!Number.isFinite(Number(questionId)) && title) {
      const tRows = await sql`SELECT question_id FROM questions WHERE title = ${title} LIMIT 1`;
      if (tRows.length) questionId = Number(tRows[0].question_id);
    }

    if (!Number.isFinite(Number(questionId)) || !language || !code) {
      return NextResponse.json({ error: 'questionId, language, and code are required in request body' }, { status: 400 });
    }
    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: 'Missing RAPIDAPI_KEY for Judge0' }, { status: 500 });
    }
  // Map language to Judge0 ID
    const langKey = String(language).toLowerCase();
    const languageId = LANGUAGE_ID_MAP[langKey];
    if (!languageId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    // Fetch limits and hidden testcases from DB
  // reuse existing sql
    const qRows = await sql`
      SELECT question_id, title, time_limit_sec, memory_limit_kb
      FROM questions WHERE question_id = ${Number(questionId)} LIMIT 1
    `;
    if (!qRows.length) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    const limits = qRows[0];
  const tRows = await sql`
      SELECT testcase_id, input_text, expected_output
      FROM question_hidden_testcases WHERE question_id = ${Number(questionId)} ORDER BY testcase_id ASC
    `;
    if (!tRows.length) {
      return NextResponse.json({ error: 'No hidden test cases configured' }, { status: 500 });
    }

    // Run against all hidden testcases
    // Normalize testcases for known problems (e.g., Two Sum)
    const titleStr = String(qRows[0]?.title || '').trim();
  const prepared = tRows.map(t => {
      let stdin = t.input_text;
      let exp = t.expected_output;
      if (titleStr.toLowerCase() === 'two sum') {
        try {
          const inp = JSON.parse(stdin);
          if (inp && Array.isArray(inp.nums) && (inp.target !== undefined)) {
            stdin = `${inp.nums.join(' ')}\n${inp.target}\n`;
          }
        } catch {}
        try {
          const arr = JSON.parse(exp);
          if (Array.isArray(arr) && arr.length === 2) {
            exp = `${arr[0]} ${arr[1]}\n`;
          }
        } catch {}
      } else if (titleStr.toLowerCase() === 'number of perfect pairs') {
        // Normalize: expect first line is space-separated nums, second line optional ignored.
        // Accept JSON {nums:[...] } or {input:{nums:[...]}}
        try {
          const raw = JSON.parse(stdin);
          const inp = raw?.input ? raw.input : raw;
          if (inp && Array.isArray(inp.nums)) {
            stdin = `${inp.nums.join(' ')}\n`;
          }
        } catch {}
        // expected_output is an integer
        try {
          const v = JSON.parse(exp);
          if (typeof v === 'number') exp = `${v}\n`;
        } catch {
          if (/^-?\d+$/.test(String(exp).trim())) exp = String(exp).trim() + '\n';
        }
      }
      return { testcase_id: t.testcase_id, stdin, expected_output: exp };
    });

    const results = [];
    for (const t of prepared) {
      try {
        const r = await judgeTestCase({
          languageId,
          sourceCode: code,
          stdin: t.stdin,
          expectedOutput: t.expected_output,
          timeLimitSec: limits.time_limit_sec ?? 1,
          memoryLimitKb: limits.memory_limit_kb ?? 256000
        });
        const status = r?.status || {};
        const verdict = mapStatusToVerdict(status);
        results.push({
          testcase_id: t.testcase_id,
          verdict,
          status,
          time: r?.time,
          memory: r?.memory,
          compile_output: r?.compile_output,
          stderr: r?.stderr,
          stdout: r?.stdout,
          time_limit_sec: limits.time_limit_sec ?? 1,
          memory_limit_kb: limits.memory_limit_kb ?? 256000
        });
        console.log(`[JUDGE0] Q${questionId} T${t.testcase_id} -> ${verdict} | status: ${status?.description || status?.name || status?.id}`);
        if (verdict === 'Compilation Error' || verdict === 'Runtime Error' || verdict === 'TLE' || verdict === 'Wrong Answer') {
          // Early return on first failure
          return NextResponse.json({ verdict, limits: { time_limit_sec: limits.time_limit_sec, memory_limit_kb: limits.memory_limit_kb }, details: results });
        }
      } catch (e) {
        console.log(`[JUDGE0] Q${questionId} T${t.testcase_id} -> Error: ${String(e?.message || e)}`);
        return NextResponse.json({ verdict: 'Runtime Error', error: String(e?.message || e) }, { status: 502 });
      }
    }

    // If all passed
    return NextResponse.json({ verdict: 'Accepted', limits: { time_limit_sec: limits.time_limit_sec, memory_limit_kb: limits.memory_limit_kb }, details: results });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
