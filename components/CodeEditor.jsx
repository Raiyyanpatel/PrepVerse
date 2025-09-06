"use client";
import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';

const languageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  js: 'javascript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
};

export default function CodeEditor({
  value,
  language = 'javascript',
  onChange,
  theme = 'vs',
  height = '28rem',
}) {
  const lang = useMemo(() => languageMap[language] || 'javascript', [language]);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <Editor
        height={height}
        value={value}
        defaultLanguage={lang}
        language={lang}
        theme={theme}
        options={{
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          smoothScrolling: false,
          cursorBlinking: 'solid',
          renderLineHighlight: 'line',
          folding: true,
          renderWhitespace: 'none',
          bracketPairColorization: { enabled: true },
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
        }}
        onChange={(v) => onChange?.(v ?? '')}
      />
    </div>
  );
}
