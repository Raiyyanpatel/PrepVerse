"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [JsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const route=useRouter()
  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const InputPromt = `Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION} interview questions and answers in JSON format based on the following: Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Only return the JSON, without any additional text.`;
    const result = await chatSession.sendMessage(InputPromt);
    const MockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    //console.log(JSON.parse(MockJsonResp))
    setJsonResponse(JSON.parse(MockJsonResp));
   if(MockJsonResp){
    const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: MockJsonResp,
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      }).returning({mockId:MockInterview.mockId})
      console.log("Insert ID:", resp)
      if(resp){
       route.push('/dashboard/interview/'+resp[0].mockId)
        setOpenDialog(false)
      }
    

   }else{
    console.log("ERROR")
   }

   setLoading(false);
   console.log(JsonResponse)
   



  };

  return (
    <div>
      <div
        className="educational-card p-8 cursor-pointer interactive-hover group"
        onClick={() => setOpenDialog(true)}
      >
        <div className="text-center">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300 pulse-glow">
              <span className="text-3xl">🎯</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Create New Interview</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            🚀 Start your AI-powered mock interview journey and get personalized feedback
          </p>
          <div className="educational-button px-6 py-3 mx-auto inline-block">
            <span className="text-lg font-semibold">+ Get Started</span>
          </div>
        </div>
      </div>
      
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl educational-card border-0">
          <DialogHeader>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl w-fit mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Create Your Interview
              </DialogTitle>
              <p className="text-gray-600">
                Let's personalize your interview experience with AI
              </p>
            </div>
            <DialogDescription>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      🎯 Tell us about your target role
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add details about your job position, description and experience level
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        💼 Job Role/Position
                      </label>
                      <Input
                        onChange={(event) => setJobPosition(event.target.value)}
                        placeholder="Ex. Full Stack Developer"
                        required
                        className="educational-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        📋 Job Description/Tech Stack
                      </label>
                      <Textarea
                        onChange={(event) => setJobDesc(event.target.value)}
                        placeholder="Ex. React, Angular, NodeJs, NextJs, MongoDB, etc."
                        required
                        className="educational-input min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🏆 Years of Experience
                      </label>
                      <Input
                        onChange={(event) => setJobExperience(event.target.value)}
                        placeholder="Ex. 5"
                        type="number"
                        max="50"
                        required
                        className="educational-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                    className="bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                  >
                    ❌ Cancel
                  </Button>
                  <Button 
                    disabled={loading} 
                    type="submit"
                    className="educational-button disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" /> 
                        🔄 Generating Interview...
                      </>
                    ) : (
                      "🚀 Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
