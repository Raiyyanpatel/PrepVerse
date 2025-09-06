"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs'
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard';

function Interviewlist() {
    const {user}=useUser();
    const [interviewList,setInterviewList]=useState([])
    useEffect(()=>{
         user&& GetInterviewList()
    },[user])
    const GetInterviewList=async()=>{
        const result=await db.select().from(MockInterview).where(eq(MockInterview.createdBy,user?.primaryEmailAddress?.emailAddress)).orderBy(desc(MockInterview.id))
        setInterviewList(result)
    }
  return (
    <div>
        <div className='mb-6'>
          <h2 className='font-bold text-3xl text-slate-800 mb-2'>Your Interview History 📚</h2>
          <p className='text-slate-600'>Review your past interviews and track your progress</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6'>
            {
                interviewList&&interviewList.map((interview,index)=>(
                    <InterviewItemCard key={index} interviewInfo={interview} />                ))
            }
        </div>
        {interviewList.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>🎯</div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>No interviews yet</h3>
            <p className='text-slate-600'>Create your first mock interview to get started!</p>
          </div>
        )}
    </div>
  )
}

export default Interviewlist