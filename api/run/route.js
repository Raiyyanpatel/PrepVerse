import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || `https://${process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'}`;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_JUDGE0 || process.env.RAPIDAPI_KEY || '';

const LANGUAGE_ID_MAP = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71
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

async function judgeOnce({ languageId, sourceCode, stdin, expectedOutput, timeLimitSec, memoryLimitKb }) {
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
  return await res.json();
}

function normalizeExampleIO(title, example_input, example_output) {
  let stdin = example_input ?? '';
  let expected = example_output ?? '';
  const t = String(title || '').trim().toLowerCase();

  if (t === 'two sum') {
    // Accept formats:
    // - "nums = [2,7,11,15], target = 9"
    // - "[2,7,11,15] 9"
    // - JSON: {"nums":[..],"target":9} or {input:{nums:[..],target:9}}
    try {
      // Try JSON first
      const raw = JSON.parse(stdin);
      const inp = raw?.input ? raw.input : raw;
      if (inp && Array.isArray(inp.nums) && inp.target !== undefined) {
        stdin = `${inp.nums.join(' ')}\n${inp.target}\n`;
      }
    } catch {
      // Try to parse "nums = [...], target = x"
      const arrMatch = String(stdin).match(/\[(.*?)\]/);
      const targMatch = String(stdin).match(/target\s*=\s*(-?\d+)/i) || String(stdin).match(/\s(-?\d+)\s*$/);
      if (arrMatch) {
        const nums = arrMatch[1].split(',').map(s=>Number(s.trim())).filter(n=>!Number.isNaN(n));
        const target = targMatch ? Number(targMatch[1]) : undefined;
        if (nums.length && target !== undefined) {
          stdin = `${nums.join(' ')}\n${target}\n`;
        }
      } else {
        // Already space-separated numbers + target?
        const parts = String(stdin).trim().split(/\s+/).map(Number);
        if (parts.length >= 2 && parts.every(n=>!Number.isNaN(n))) {
          const target = parts[parts.length-1];
          const nums = parts.slice(0,-1);
          stdin = `${nums.join(' ')}\n${target}\n`;
        }
      }
    }

    // Normalize expected: "[i,j]" -> "i j\n"
    try {
      const rawE = JSON.parse(expected);
      const arr = Array.isArray(rawE) ? rawE : (Array.isArray(rawE?.expected_output) ? rawE.expected_output : null);
      if (arr && arr.length === 2) expected = `${arr[0]} ${arr[1]}\n`;
    } catch {
      const m = String(expected).trim().match(/^-?\d+\s*,\s*-?\d+$/) || String(expected).trim().match(/\[(.*?)\]/);
      if (m) {
        const txt = m[1] ? m[1] : String(expected).trim();
        const parts = txt.replace(/[\[\]]/g,'').split(/\s*,\s*|\s+/).map(Number).filter(n=>!Number.isNaN(n));
        if (parts.length === 2) expected = `${parts[0]} ${parts[1]}\n`;
      } else if (/^-?\d+\s+-?\d+$/.test(String(expected).trim())) {
        expected = String(expected).trim() + '\n';
      }
    }
  } else if (t === 'number of perfect pairs') {
    try {
      const raw = JSON.parse(stdin);
      const inp = raw?.input ? raw.input : raw;
      if (inp && Array.isArray(inp.nums)) stdin = `${inp.nums.join(' ')}\n`;
    } catch {
      const m = String(stdin).match(/\[(.*?)\]/);
      if (m) {
        const nums = m[1].split(',').map(s=>Number(s.trim())).filter(n=>!Number.isNaN(n));
        if (nums.length) stdin = `${nums.join(' ')}\n`;
      }
    }
    try {
      const v = JSON.parse(expected);
      if (typeof v === 'number') expected = `${v}\n`;
    } catch {
      if (/^-?\d+$/.test(String(expected).trim())) expected = String(expected).trim() + '\n';
    }
  }

  return { stdin: String(stdin ?? ''), expected_output: String(expected ?? '') };
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { questionId, language, code } = body || {};

    const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
    if (!DB_URL) return NextResponse.json({ error: 'Missing DB URL' }, { status: 500 });
    const sql = neon(DB_URL);

    if (!Number.isFinite(Number(questionId)) || !language || !code) {
      return NextResponse.json({ error: 'questionId, language, and code are required in request body' }, { status: 400 });
    }
    if (!RAPIDAPI_KEY) return NextResponse.json({ error: 'Missing RAPIDAPI_KEY for Judge0' }, { status: 500 });

    const langKey = String(language).toLowerCase();
    const languageId = LANGUAGE_ID_MAP[langKey];
    if (!languageId) return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });

    // Load question and limits + example IO
    const rows = await sql`
      SELECT question_id, title, example_input, example_output, time_limit_sec, memory_limit_kb
      FROM questions WHERE question_id = ${Number(questionId)} LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    const q = rows[0];

    const { stdin, expected_output } = normalizeExampleIO(q.title, q.example_input, q.example_output);

    const r = await judgeOnce({
      languageId,
      sourceCode: code,
      stdin,
      expectedOutput: expected_output,
      timeLimitSec: q.time_limit_sec ?? 1,
      memoryLimitKb: q.memory_limit_kb ?? 256000
    });

    const status = r?.status || {};
    const verdict = mapStatusToVerdict(status);

    return NextResponse.json({
      verdict,
      limits: { time_limit_sec: q.time_limit_sec ?? 1, memory_limit_kb: q.memory_limit_kb ?? 256000 },
      result: {
        status,
        time: r?.time,
        memory: r?.memory,
        stdout: r?.stdout,
        stderr: r?.stderr,
        compile_output: r?.compile_output
      },
      normalized: { stdin, expected_output }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
