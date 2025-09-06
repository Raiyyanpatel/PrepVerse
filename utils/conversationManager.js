import { chatSession } from './GeminiAIModel';

class ConversationManager {
  constructor() {
    this.conversationHistory = [];
    this.currentQuestion = null;
    this.interviewContext = null;
  }

  initializeInterview(jobPosition, jobDesc, experienceLevel) {
    this.interviewContext = {
      jobPosition,
      jobDesc,
      experienceLevel,
      startTime: new Date()
    };

    const systemMessage = `You are an AI interviewer conducting a professional job interview for a ${jobPosition} position. 
    
Job Description: ${jobDesc}
Experience Level: ${experienceLevel}

Guidelines:
1. Ask relevant, thoughtful questions about the candidate's experience, skills, and fit for the role
2. Follow up naturally based on their responses
3. Keep responses conversational and professional
4. Ask one question at a time
5. Maintain a friendly but professional tone
6. Adapt questions based on their previous answers
7. Each response should be 1-3 sentences maximum for natural conversation flow

Start the interview with a warm greeting and your first question.`;

    this.conversationHistory = [
      { role: 'system', content: systemMessage }
    ];

    return this.getNextAIResponse();
  }

  async addHumanMessage(message) {
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    return this.getNextAIResponse();
  }

  async getNextAIResponse() {
    try {
      // Create conversation context for Gemini
      const conversationContext = this.conversationHistory
        .map(msg => `${msg.role === 'system' ? 'System' : msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `${conversationContext}

Interviewer:`;

      const result = await chatSession.sendMessage(prompt);
      let aiResponse = result.response.text();

      // Clean up the response - remove "Interviewer:" prefix if it exists
      aiResponse = aiResponse.replace(/^Interviewer:\s*/i, '').trim();

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      return aiResponse;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I apologize, but I'm having trouble processing your response. Could you please repeat that?";
    }
  }

  getConversationHistory() {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  getInterviewSummary() {
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user');
    const aiMessages = this.conversationHistory.filter(msg => msg.role === 'assistant');
    
    return {
      totalQuestions: aiMessages.length,
      totalAnswers: userMessages.length,
      conversationHistory: this.getConversationHistory(),
      interviewContext: this.interviewContext,
      duration: new Date() - this.interviewContext.startTime
    };
  }

  reset() {
    this.conversationHistory = [];
    this.currentQuestion = null;
    this.interviewContext = null;
  }
}

export default ConversationManager;
