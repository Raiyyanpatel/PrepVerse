import { Button } from '@/components/ui/button'

import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({interviewInfo}) {
   const router=useRouter()
    const onStart=()=>{
        console.log("first")
       router.push(`/dashboard/interview/${interviewInfo?.mockId}`)
    }
    const onFeedback=()=>{
        router.push(`/dashboard/interview/${interviewInfo.mockId}/feedback`)
    }
  return (
    <div className='history-card hover-glow h-full'>
        <div className='mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-2xl'>💼</span>
            <h2 className='font-bold text-lg text-slate-800'>{interviewInfo?.jobPosition}</h2>
          </div>
          <div className='space-y-1'>
            <div className='flex items-center gap-2 text-sm text-slate-600'>
              <span>⏱️</span>
              <span>{interviewInfo?.jobExperience} Years Experience</span>
            </div>
            <div className='flex items-center gap-2 text-xs text-slate-500'>
              <span>📅</span>
              <span>Created: {interviewInfo.createdAt}</span>
            </div>
          </div>
        </div>
        
        <div className='flex justify-between mt-4 gap-3'>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
              onClick={onFeedback}
            >
              📊 Feedback
            </Button>
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
              onClick={onStart}
            >
              🚀 Start
            </Button>
        </div>
    </div>
  )
}

export default InterviewItemCard