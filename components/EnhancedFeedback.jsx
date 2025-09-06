"use client";
import React from 'react';
import { 
  Brain, 
  Eye, 
  Volume2, 
  Monitor, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';

const EnhancedFeedback = ({ basicFeedback, proctoringData, violations = [] }) => {
  // Generate comprehensive feedback based on proctoring data
  const generateProctoringFeedback = () => {
    const feedback = {
      emotional: {
        score: 0,
        insights: [],
        recommendations: []
      },
      behavioral: {
        score: 0,
        insights: [],
        recommendations: []
      },
      technical: {
        score: 0,
        insights: [],
        recommendations: []
      },
      overall: {
        score: 0,
        strengths: [],
        improvements: []
      }
    };

    // Emotional Analysis
    if (proctoringData?.emotion) {
      const emotions = ['confident', 'focused', 'neutral'];
      const positiveEmotions = emotions.filter(e => 
        proctoringData.emotion.dominant === e
      ).length;
      
      feedback.emotional.score = Math.round((positiveEmotions / emotions.length) * 100);
      
      if (proctoringData.emotion.dominant === 'confident') {
        feedback.emotional.insights.push('Displayed high confidence throughout the interview');
        feedback.overall.strengths.push('Strong emotional composure');
      } else if (proctoringData.emotion.dominant === 'nervous') {
        feedback.emotional.insights.push('Showed signs of nervousness during responses');
        feedback.emotional.recommendations.push('Practice mock interviews to build confidence');
        feedback.overall.improvements.push('Work on managing interview anxiety');
      }
    }

    // Behavioral Analysis
    if (proctoringData?.eyeTracking) {
      const focusScore = proctoringData.eyeTracking.focusScore || 0;
      feedback.behavioral.score = focusScore;
      
      if (focusScore > 80) {
        feedback.behavioral.insights.push('Maintained excellent eye contact and focus');
        feedback.overall.strengths.push('Strong attention and engagement');
      } else if (focusScore < 60) {
        feedback.behavioral.insights.push('Attention wandered during several questions');
        feedback.behavioral.recommendations.push('Practice maintaining consistent eye contact');
        feedback.overall.improvements.push('Improve focus and attention during responses');
      }
    }

    // Technical/Voice Analysis
    if (proctoringData?.voice) {
      const voiceScore = Math.round((
        proctoringData.voice.clarity + 
        proctoringData.voice.pace + 
        proctoringData.voice.volume + 
        proctoringData.voice.confidence
      ) / 4);
      
      feedback.technical.score = voiceScore;
      
      if (proctoringData.voice.clarity > 80) {
        feedback.technical.insights.push('Spoke with excellent clarity and articulation');
        feedback.overall.strengths.push('Clear communication skills');
      } else {
        feedback.technical.recommendations.push('Work on speaking more clearly and distinctly');
      }
      
      if (proctoringData.voice.pace > 70) {
        feedback.technical.insights.push('Maintained appropriate speaking pace');
      } else {
        feedback.technical.recommendations.push('Consider slowing down your speaking pace');
      }
    }

    // Violations Impact
    if (violations.length > 0) {
      feedback.behavioral.score = Math.max(0, feedback.behavioral.score - (violations.length * 10));
      feedback.behavioral.insights.push(`${violations.length} attention lapses detected`);
      feedback.behavioral.recommendations.push('Focus on maintaining consistent attention');
      feedback.overall.improvements.push('Minimize distractions during interviews');
    }

    // Overall Score Calculation
    feedback.overall.score = Math.round((
      feedback.emotional.score + 
      feedback.behavioral.score + 
      feedback.technical.score
    ) / 3);

    return feedback;
  };

  const proctoringFeedback = generateProctoringFeedback();

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Overall Score */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="h-6 w-6" />
          Comprehensive Interview Analysis
        </h2>
        
        <div className={`rounded-lg p-4 border ${getScoreBg(proctoringFeedback.overall.score)}`}>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(proctoringFeedback.overall.score)}`}>
              {proctoringFeedback.overall.score}%
            </div>
            <div className="text-white text-sm mt-1">Overall Performance</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emotional Intelligence */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Emotional Analysis
          </h3>
          
          <div className="mb-4">
            <div className={`text-2xl font-bold ${getScoreColor(proctoringFeedback.emotional.score)}`}>
              {proctoringFeedback.emotional.score}%
            </div>
            <div className="text-gray-300 text-sm">Emotional Composure</div>
          </div>

          <div className="space-y-2">
            {proctoringFeedback.emotional.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
            
            {proctoringFeedback.emotional.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Analysis */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Behavioral Analysis
          </h3>
          
          <div className="mb-4">
            <div className={`text-2xl font-bold ${getScoreColor(proctoringFeedback.behavioral.score)}`}>
              {proctoringFeedback.behavioral.score}%
            </div>
            <div className="text-gray-300 text-sm">Attention & Focus</div>
          </div>

          <div className="space-y-2">
            {proctoringFeedback.behavioral.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
            
            {proctoringFeedback.behavioral.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-green-400" />
            Communication Analysis
          </h3>
          
          <div className="mb-4">
            <div className={`text-2xl font-bold ${getScoreColor(proctoringFeedback.technical.score)}`}>
              {proctoringFeedback.technical.score}%
            </div>
            <div className="text-gray-300 text-sm">Voice & Delivery</div>
          </div>

          <div className="space-y-2">
            {proctoringFeedback.technical.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
            
            {proctoringFeedback.technical.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Violations Summary */}
      {violations.length > 0 && (
        <div className="bg-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-orange-400" />
            Proctoring Alerts ({violations.length})
          </h3>
          
          <div className="space-y-2">
            {violations.map((violation, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">{violation.message}</p>
                  <p className="text-orange-300 text-xs">{violation.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Key Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <h4 className="text-green-400 font-semibold mb-2">Strengths to Leverage</h4>
            <ul className="space-y-1">
              {proctoringFeedback.overall.strengths.map((strength, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Areas for Improvement</h4>
            <ul className="space-y-1">
              {proctoringFeedback.overall.improvements.map((improvement, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Basic Feedback Integration */}
      {basicFeedback && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Content Analysis</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{basicFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFeedback;
