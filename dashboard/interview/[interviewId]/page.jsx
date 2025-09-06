"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon, ShieldCheck, Mic } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  useEffect(() => {
    GetInterviewDetail();
  }, []);

  /**
   * Used to Get Interview Details by MockId/Interview Id
   */

  const GetInterviewDetail = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
    console.log(result);
    setInterviewData(result[0]);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Let’s get you interview-ready
          </h1>
          <p className="text-slate-600 mt-2">
            Review your role details, enable your camera, and choose your interview style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Details and tips */}
          <div className="space-y-6">
            <div className="modern-card p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Job Position</div>
                  <div className="text-lg font-semibold text-slate-900">{interviewData?.jobPosition || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Experience</div>
                  <div className="text-lg font-semibold text-slate-900">{interviewData?.jobExperience || "—"} years</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Description</div>
                  <p className="text-slate-700 leading-relaxed">
                    {interviewData?.jobDesc || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="history-card">
              <div className="flex items-start gap-3">
                <div className="icon-container-orange"><Lightbulb className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Tip</h3>
                  <p className="text-slate-600 mt-1">{process.env.NEXT_PUBLIC_INFORMATION}</p>
                </div>
              </div>
            </div>

            <div className="history-card">
              <div className="flex items-start gap-3">
                <div className="icon-container-blue"><Mic className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">New: Conversational Interview</h3>
                  <p className="text-slate-600 mt-1">
                    Experience a natural, voice-based interview where the AI speaks questions aloud and you respond in real-time. It feels like a real conversation.
                  </p>
                  <ul className="mt-3 text-slate-600 list-disc list-inside space-y-1">
                    <li>Realistic voice interaction</li>
                    <li>Better flow and engagement</li>
                    <li>Hands-free experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Camera card */}
          <div>
            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Camera & Microphone</h3>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure
                </div>
              </div>

              {webCamEnabled ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <Webcam
                      mirrored={true}
                      style={{ width: "100%", height: "auto", aspectRatio: "4/3" }}
                      onUserMedia={() => setWebCamEnabled(true)}
                      onUserMediaError={() => setWebCamEnabled(false)}
                    />
                  </div>
                  <div className="text-sm text-emerald-600">Camera enabled. You’re good to go.</div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="icon-container-purple mb-4"><WebcamIcon className="h-6 w-6" /></div>
                  <p className="text-slate-600 mb-4 max-w-sm">
                    Enable your camera and microphone for a seamless interview experience. You can disable them anytime.
                  </p>
                  <Button className="btn-secondary" onClick={() => setWebCamEnabled(true)}>
                    Enable Camera & Microphone
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
          <Link href={`/dashboard/interview/${params.interviewId}/start`}>
            <Button className="btn-primary">Traditional Interview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Interview;
