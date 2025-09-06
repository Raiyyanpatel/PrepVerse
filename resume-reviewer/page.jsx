"use client";
import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Upload, Loader2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// Using Puter.js for file-based AI analysis; Gemini chat not used here

function ResumeReviewerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Dynamically load Puter.js client-side
  const ensurePuterLoaded = async () => {
    if (typeof window === 'undefined') return false;
    if (window.puter?.ai?.chat && window.puter?.fs?.write) return true;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://js.puter.com/v2/';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(s);
    });
    return !!window.puter?.ai?.chat;
  };

  // We no longer extract PDF text client-side. We upload the file to Puter and let AI read it.

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        // For PDF we will upload to Puter at analyze time
        setUploadedFile(file);
        setUploadedFileName(file.name);
        toast.success('PDF ready for AI analysis.');
      } else {
        setUploadedFile(null);
        setUploadedFileName('');
        toast.error('Please upload a PDF file (.pdf)');
      }
    }
  };

  const analyzeResume = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a PDF resume');
      return;
    }

    setIsLoading(true);
    let tempPath = null;
    try {
      const ok = await ensurePuterLoaded();
      if (!ok) throw new Error('Puter.js not available');

      // Build chat content depending on input type
      const content = [];
  const ext = 'pdf';
  const puterFile = await window.puter.fs.write(`temp_resume_${Date.now()}.${ext}`, uploadedFile);
  tempPath = puterFile.path;
  content.push({ type: 'file', puter_path: tempPath });

  // Add the analysis instruction with required JSON schema (PDF-only, no LaTeX)
      content.push({
        type: 'text',
        text: `Please review the resume and respond ONLY with a valid JSON matching this schema:\n{
          "overall_score": "X/10",
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"],
          "improvements": ["improvement1", "improvement2"],
          "ats_tips": ["tip1", "tip2"],
          "industry_advice": "detailed industry-specific advice"
        }\nReturn only JSON, no prose or code fences.`
      });

      const completion = await window.puter.ai.chat([
        { role: 'user', content }
      ], { model: 'claude-sonnet-4', stream: true });

      let text = '';
      for await (const part of completion) {
        text += part?.text || '';
      }

      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Try to extract JSON block
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (!m) throw e;
        parsed = JSON.parse(m[0]);
      }

  setReview(parsed);
      toast.success('Resume analysis completed!');

    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(`Failed to analyze resume: ${error.message}`);
    } finally {
      setIsLoading(false);
      // Cleanup any uploaded temp file
      if (tempPath) {
        try { await window.puter.fs.delete(tempPath); } catch {}
      }
    }
  };

  // LaTeX helpers removed per request

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="icon-container-blue">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Resume Reviewer</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Input Section */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload Your Resume (PDF)</h2>
            
            {/* File Upload */}
            <div className="mb-6">
              <label htmlFor="file-upload" className="block text-slate-700 mb-2">
                Upload Resume (PDF only)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('file-upload').click()}
                className="w-full btn-secondary"
              >
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume PDF (.pdf)
                </>
              </Button>
            </div>

            {/* Selected file name (for non-text uploads) */}
            {uploadedFileName && (
              <div className="mb-6 text-sm text-slate-600">Selected: {uploadedFileName}</div>
            )}

            {/* Text input removed: PDF only */}

            {/* Analyze Button */}
            <Button
              onClick={analyzeResume}
              disabled={isLoading || !uploadedFile}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">AI Review Results</h2>
            
            {!review && !isLoading && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Upload and analyze your resume to see AI feedback</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Analyzing your resume...</p>
              </div>
            )}

            {review && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="history-card">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Overall Score</h3>
                  <div className="text-3xl font-bold text-emerald-600">{review.overall_score}</div>
                </div>

                {/* Strengths */}
                <div className="history-card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">✅ Strengths</h3>
                  <ul className="space-y-2">
                    {review.strengths?.map((strength, index) => (
                      <li key={index} className="text-slate-700 text-sm">• {strength}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="history-card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">⚠️ Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {review.weaknesses?.map((weakness, index) => (
                      <li key={index} className="text-slate-700 text-sm">• {weakness}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="history-card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">🚀 Suggested Improvements</h3>
                  <ul className="space-y-2">
                    {review.improvements?.map((improvement, index) => (
                      <li key={index} className="text-slate-700 text-sm">• {improvement}</li>
                    ))}
                  </ul>
                </div>

                {/* ATS Tips */}
                <div className="history-card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">🎯 ATS Optimization Tips</h3>
                  <ul className="space-y-2">
                    {review.ats_tips?.map((tip, index) => (
                      <li key={index} className="text-slate-700 text-sm">• {tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Industry Advice */}
                {review.industry_advice && (
                  <div className="history-card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">💼 Industry-Specific Advice</h3>
                    <p className="text-slate-700 text-sm">{review.industry_advice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

  {/* LaTeX output removed */}
      </div>
    </div>
  );
}

export default ResumeReviewerPage;
