import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSections({activeQuestionIndex,mockInterViewQuestion}) {
    
   const textToSpeach=(text)=>{
    if('speechSynthesis' in window){
      const speech= new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech)
    }else{
      alert('Sorry, Your browser does not sport text to speech (recommended browser Chrome)')
    }

   }
  return mockInterViewQuestion&&(
    <div className='bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 my-6'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-center mb-6'>
            {mockInterViewQuestion&&mockInterViewQuestion?.map((question,index)=>(
                 <h2 key={index+1} className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer transition-all duration-300 ${activeQuestionIndex==index?'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md':'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>Question #{index+1}</h2>
            ))}
        </div>
        <h2 className='my-5 text-sm md:text-lg text-white'>
          <strong className='text-blue-400'>Q.</strong> {mockInterViewQuestion[activeQuestionIndex]?.question}
        </h2>
        <Volume2 className='cursor-pointer text-blue-400 hover:text-blue-300 transition-colors duration-300' onClick={()=>textToSpeach(mockInterViewQuestion[activeQuestionIndex]?.question)} />
        <div className='bg-blue-900/20 border border-blue-600 rounded-lg p-5 mt-6'>
            <h2 className='flex gap-2 items-center text-blue-300'>
                <Lightbulb/>
                <strong>Note:</strong>
            </h2>
            <h2 className='my-2 text-sm text-blue-200'>
                {process.env.NEXT_PUBLIC_QUESTION_NOTE || "Click the microphone to start recording your answer. Maintain eye contact with the camera and speak clearly."}
            </h2>
        </div>
    </div>
  )
}

export default QuestionsSections