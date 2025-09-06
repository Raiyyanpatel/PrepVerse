"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Code2, PlayCircle, Send, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });

export default function QuestionDetail({ params }) {
  const id = Number(params?.id);
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const languages = useMemo(() => ([
    { key: 'cpp', label: 'C++' },
    { key: 'c', label: 'C' },
    { key: 'java', label: 'Java' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
  ]), []);

  const defaultTemplates = useMemo(() => ({
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: read input and print output\n    return 0;\n}\n`,
    c: `#include <stdio.h>\nint main(){\n    // TODO: read input and print output\n    return 0;\n}\n`,
    java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args){\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and print output\n    }\n}\n`,
    javascript: `// Write your code here\nfunction solve() {\n  // TODO\n}\n// console.log(solve());\n`,
    python: `# Write your code here\ndef solve():\n    # TODO\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  }), []);

  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codeByLang, setCodeByLang] = useState(() => ({ ...defaultTemplates }));
  const [code, setCode] = useState(defaultTemplates['javascript']);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs');
  const [finalVerdict, setFinalVerdict] = useState('');

  const verdictStyle = (v) => {
    const key = String(v || '').toLowerCase();
    if (key === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
    if (key === 'wrong answer') return 'bg-red-100 text-red-700 border-red-200';
    if (key === 'compilation error') return 'bg-red-100 text-red-700 border-red-200';
    if (key === 'runtime error') return 'bg-red-100 text-red-700 border-red-200';
    if (key === 'memory limit exceeded') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (key === 'tle' || key === 'time limit exceeded') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Safely format math-like caret exponents into HTML superscripts, e.g., 10^9 -> 10<sup>9</sup>
  const formatMath = (txt, useBr = true) => {
    if (!txt) return '';
    const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let out = escapeHtml(String(txt));
    // number^number (e.g., 10^9)
    out = out.replace(/(\b-?\d+)\^(\d+\b)/g, '$1<sup>$2</sup>');
    // var^number (e.g., x^2)
    out = out.replace(/(\b[a-zA-Z])\^(\d+\b)/g, '$1<sup>$2</sup>');
    // var^var (e.g., x^y)
    out = out.replace(/(\b[a-zA-Z])\^(\b[a-zA-Z]\b)/g, '$1<sup>$2</sup>');
    if (useBr) out = out.replace(/\n/g, '<br/>');
    return out;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/questions/${id}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load');
        setQ(data);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };
    if (Number.isFinite(id)) load();
  }, [id]);

  const runCode = async () => {
    try {
      setRunning(true);
  setFinalVerdict('');
  setOutput('Running...');
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q?.question_id || id, language: selectedLang, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Run failed');
  const v = String(data?.verdict || 'Unknown');
  setFinalVerdict(v);
  setOutput('');
    } catch (e) {
      setOutput(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    try {
      setRunning(true);
      setOutput('Judging...');
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: q?.question_id || id,
          language: selectedLang,
          code
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Judge failed');
  const verdict = (data?.verdict && String(data.verdict)) || 'Compilation Error';
  if (verdict === 'Accepted') toast.success('Accepted'); else toast.error(verdict);
  setFinalVerdict(verdict);
  setOutput('');
    } catch (e) {
      toast.error(String(e?.message || e));
      setOutput(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/practice/dsa">
              <Button className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="icon-container-blue">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">DSA Practice</h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="modern-card border border-red-100 bg-red-50 text-red-700 p-4 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Question description */}
          <div className="modern-card p-6">
            {loading ? (
              <div className="h-64 bg-slate-100 rounded-xl" />
            ) : (
              q && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{q.title}</h2>
                  <div className="text-sm text-slate-500 mb-4">Difficulty: {q.difficulty}</div>
                  <div
                    className="prose prose-slate max-w-none text-slate-700 mb-6"
                    dangerouslySetInnerHTML={{ __html: formatMath(q.description, true) }}
                  />
                  {q.constraints && (
                    <div className="history-card p-4 mb-4">
                      <h3 className="font-semibold text-slate-800 mb-2">Constraints</h3>
                      <pre
                        className="text-sm text-slate-700 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatMath(q.constraints, false) }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="history-card p-4">
                      <h4 className="font-semibold text-slate-800 mb-1">Example Input</h4>
                      <pre
                        className="text-sm text-slate-700 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatMath(q.example_input, false) }}
                      />
                    </div>
                    <div className="history-card p-4">
                      <h4 className="font-semibold text-slate-800 mb-1">Example Output</h4>
                      <pre
                        className="text-sm text-slate-700 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatMath(q.example_output, false) }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right: IDE mock */}
          <div className="modern-card p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-slate-800 font-semibold">Editor</div>
              <div className="flex items-center gap-2">
                <label htmlFor="lang" className="text-xs text-slate-500">Language</label>
                <select
                  id="lang"
                  value={selectedLang}
                  onChange={(e) => {
                    // persist current code into map, then switch
                    setCodeByLang((prev) => ({ ...prev, [selectedLang]: code }));
                    const next = e.target.value;
                    setSelectedLang(next);
                    setCode((prev) => (codeByLang[next] ?? defaultTemplates[next] ?? ''));
                  }}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {languages.map((l) => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">Theme</div>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="vs">Light</option>
                <option value="vs-dark">Dark</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
            <CodeEditor
              value={code}
              language={selectedLang}
              theme={editorTheme}
              height="28rem"
              onChange={(val) => {
                setCode(val);
                setCodeByLang((prev) => ({ ...prev, [selectedLang]: val }));
              }}
            />
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={runCode} disabled={running} className="btn-primary">
                <PlayCircle className="h-4 w-4 mr-2" /> Run
              </Button>
              <Button onClick={submitCode} disabled={running} className="btn-success">
                <Send className="h-4 w-4 mr-2" /> Submit
              </Button>
            </div>
            <div className="history-card p-3 mt-4 min-h-20 text-sm text-slate-700">
              {finalVerdict ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-full border font-semibold ${verdictStyle(finalVerdict)}`}>
                  {finalVerdict}
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{output || 'Output will appear here.'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
