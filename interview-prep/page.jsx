"use client";
import React, { useState, useEffect } from 'react';
import { Target, ArrowLeft, Search, ChevronDown, ChevronUp, Lightbulb, Loader2, BrainCircuit, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatSession } from '@/utils/GeminiAIModel';
import { toast } from 'sonner';

function InterviewPrepPage() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    try {
      const savedTopic = localStorage.getItem('interviewPrepTopic');
      const savedQuestions = localStorage.getItem('interviewPrepQuestions');
      const savedQuestionCount = localStorage.getItem('interviewPrepQuestionCount');
      const savedExpandedQuestions = localStorage.getItem('interviewPrepExpandedQuestions');

      if (savedTopic && savedTopic !== 'null' && savedTopic !== '') {
        setTopic(savedTopic);
      }
      
      if (savedQuestions && savedQuestions !== 'null' && savedQuestions !== '[]') {
        try {
          const parsedQuestions = JSON.parse(savedQuestions);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
          }
        } catch (e) {
          console.error('Error parsing saved questions:', e);
        }
      }
      
      if (savedQuestionCount && savedQuestionCount !== 'null') {
        const count = parseInt(savedQuestionCount);
        if (!isNaN(count) && count > 0) {
          setQuestionCount(count);
        }
      }
      
      if (savedExpandedQuestions && savedExpandedQuestions !== 'null') {
        try {
          const parsedExpanded = JSON.parse(savedExpandedQuestions);
          if (typeof parsedExpanded === 'object' && parsedExpanded !== null) {
            setExpandedQuestions(parsedExpanded);
          }
        } catch (e) {
          console.error('Error parsing saved expanded questions:', e);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [isClient]);

  // Save data to localStorage whenever state changes (but avoid saving empty states)
  useEffect(() => {
    if (!isClient) return; // Only run on client side
    if (topic && topic.trim() !== '') {
      localStorage.setItem('interviewPrepTopic', topic);
    }
  }, [topic, isClient]);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    if (questions.length > 0) {
      localStorage.setItem('interviewPrepQuestions', JSON.stringify(questions));
    }
  }, [questions, isClient]);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    if (questionCount > 0) {
      localStorage.setItem('interviewPrepQuestionCount', questionCount.toString());
    }
  }, [questionCount, isClient]);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    localStorage.setItem('interviewPrepExpandedQuestions', JSON.stringify(expandedQuestions));
  }, [expandedQuestions, isClient]);

  const generateQuestions = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate exactly ${questionCount} interview questions for the topic "${topic}". 

CRITICAL REQUIREMENTS:
- Return ONLY a valid JSON array with no additional text, formatting, or explanations
- Keep answers concise but comprehensive (maximum 200-300 words per answer)
- AVOID using quotes (") inside the answer text - use single quotes (') instead
- AVOID special characters like newlines, tabs, or backslashes in the content
- Ensure the response is complete and not truncated
- Use simple, clean text without code blocks or special formatting

The response must be a JSON array where each object has exactly these fields:
- "question": string (the interview question)
- "answer": string (concise answer using only simple text, no quotes or special chars)

Example format:
[
  {
    "question": "What is Node.js?",
    "answer": "Node.js is a JavaScript runtime built on Chrome V8 engine that allows developers to run JavaScript on the server side. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient."
  }
]

Topic: ${topic}
Number of questions: ${questionCount}

Return only the complete JSON array, ensure it ends with ']'.`;

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      
      // Clean the response more thoroughly
      let cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\w\s]*?(?=\[)/g, '') // Remove any text before the JSON array
        .replace(/(?<=\])\s*[\w\s]*$/g, '') // Remove any text after the JSON array
        .trim();

      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      console.log('Cleaned response:', cleanedResponse.substring(0, 500) + '...');
      console.log('Full response length:', cleanedResponse.length);
      
      let generatedQuestions;
      try {
        generatedQuestions = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text length:', responseText.length);
        console.error('Cleaned response length:', cleanedResponse.length);
        console.error('Error position:', parseError.message.match(/position (\d+)/)?.[1]);
        
        // Log the problematic area around the error position
        const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || 0);
        if (errorPos > 0) {
          const start = Math.max(0, errorPos - 100);
          const end = Math.min(cleanedResponse.length, errorPos + 100);
          console.error('Content around error:', cleanedResponse.substring(start, end));
        }
        
        // Try to fix common JSON issues and reparse
        try {
          // Alternative cleaning approach
          let fixedResponse = cleanedResponse;
          
          // Try to extract and parse individual question objects
          const questionObjects = [];
          
          // More robust regex that handles escaped quotes and complex content
          const regex = /\{\s*"question"\s*:\s*"([^"]+)"\s*,\s*"answer"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/gs;
          let match;
          
          while ((match = regex.exec(cleanedResponse)) !== null) {
            try {
              const question = match[1];
              let answer = match[2];
              
              // Properly unescape the answer content
              answer = answer
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\\\/g, '\\');
              
              const questionObj = {
                question: question,
                answer: answer
              };
              
              questionObjects.push(questionObj);
            } catch (objError) {
              console.log('Skipping malformed question object:', match[0].substring(0, 100));
            }
          }
          
          if (questionObjects.length > 0) {
            console.log(`Extracted ${questionObjects.length} valid questions using regex parsing`);
            generatedQuestions = questionObjects;
          } else {
            throw new Error('Unable to extract valid questions from the response.');
          }
        } catch (secondError) {
          console.error('Secondary parsing also failed:', secondError);
          throw new Error('Unable to parse AI response. The response contains malformed JSON. Please try again.');
        }
      }

      // Validate the response structure
      if (!Array.isArray(generatedQuestions)) {
        throw new Error('AI response is not an array of questions');
      }

      // Validate each question object
      const validQuestions = generatedQuestions.filter(q => 
        q && typeof q === 'object' && q.question && q.answer
      );

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in AI response');
      }
      
      // Update state and localStorage will be handled by useEffect
      setQuestions(validQuestions);
      setExpandedQuestions({});
      
      console.log('Questions generated and saved:', validQuestions.length);
      toast.success(`Generated ${validQuestions.length} questions!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Provide more specific error messages
      if (error.message.includes('malformed JSON')) {
        toast.error('AI response contains formatting errors. Please try again with a simpler topic.');
      } else if (error.message.includes('truncated')) {
        toast.error('AI response was incomplete. Try reducing the number of questions or using a simpler topic.');
      } else if (error.message.includes('Invalid JSON')) {
        toast.error('AI response format error. Please try again with fewer questions.');
      } else if (error.message.includes('not an array')) {
        toast.error('Unexpected AI response format. Please try again.');
      } else if (error.message.includes('No valid questions')) {
        toast.error('AI did not generate valid questions. Please try again.');
      } else {
        toast.error('Error generating questions. Try reducing the number of questions or simplifying the topic.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to clear all stored data
  const clearStoredData = () => {
    if (!isClient) return; // Only run on client side
    
    localStorage.removeItem('interviewPrepTopic');
    localStorage.removeItem('interviewPrepQuestions');
    localStorage.removeItem('interviewPrepQuestionCount');
    localStorage.removeItem('interviewPrepExpandedQuestions');
    setTopic('');
    setQuestions([]);
    setQuestionCount(5);
    setExpandedQuestions({});
    toast.success('Cleared all data!');
  };

  const toggleAnswer = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button className="btn-secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="icon-container-orange pulse-glow">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  🎯 Interview Prep
                </h1>
              </div>
            </div>
            
            {/* Clear Data Button */}
            {questions.length > 0 && (
              <Button 
                onClick={clearStoredData}
                variant="outline" 
                size="sm"
                className="bg-red-100 text-red-600 border-red-200 hover:bg-red-200 rounded-xl"
              >
                🗑️ Clear Data
              </Button>
            )}
          </div>
        </div>

        {/* Question Generator Form */}
        <div className="modern-card p-8 mb-8 hover-lift">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              ✨ Generate Interview Questions
            </h2>
            <p className="text-slate-600">
              AI-powered interview questions with detailed answers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-3">
                📚 Topic/Technology
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic you want to practice (e.g., React, Node.js, Machine Learning)"
                className="modern-input text-lg"
                onKeyPress={(e) => e.key === 'Enter' && generateQuestions()}
              />
              <p className="text-slate-500 text-sm mt-2">
                💡 Be specific for better results
              </p>
            </div>
            
            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                🔢 Number of Questions
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                className="modern-input text-lg"
              />
              <p className="text-slate-500 text-sm mt-2">
                ⭐ Recommended: 5-10 questions for best results
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
              <Button 
                onClick={generateQuestions}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  🔄 Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  ✨ Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="modern-card p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="icon-container-orange">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  📝 Interview Questions for "{topic}" 
                </h2>
              </div>
              <div className="achievement-badge text-sm">
                🎯 {questions.length} Questions Generated
              </div>
            </div>

            {questions.map((item, index) => (
              <div key={index} className="feature-card hover-glow bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <span className="icon-container-orange text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                          Q{index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
                          {item.question}
                        </h3>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => toggleAnswer(index)}
                      variant="outline"
                      size="sm"
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      {expandedQuestions[index] ? (
                        <>
                          🙈 Hide Answer <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          👁️ Show Answer <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Answer Section */}
                  {expandedQuestions[index] && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full pulse-glow"></div>
                          <span className="text-green-700 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">
                            ✅ SAMPLE ANSWER
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Generate More Button */}
            <div className="text-center pt-6">
              <Button
                onClick={generateQuestions}
                disabled={loading}
                className="btn-primary"
              >
                Generate More Questions
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !loading && (
          <div className="modern-card p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Practice?</h2>
              <p className="text-xl text-slate-600 mb-8">
                Enter any topic above to generate personalized interview questions with detailed answers!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {['React.js', 'Node.js', 'Python', 'Machine Learning', 'System Design', 'Data Structures', 'JavaScript', 'Cloud Computing'].map((sampleTopic) => (
                  <button
                    key={sampleTopic}
                    onClick={() => setTopic(sampleTopic)}
                    className="btn-secondary rounded-xl p-3"
                  >
                    {sampleTopic}
                  </button>
                ))}
              </div>
              
              <p className="text-slate-500 text-sm">
                Click on any topic above or enter your own custom topic
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewPrepPage;
