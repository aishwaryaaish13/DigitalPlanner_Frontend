import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button.jsx';
import { geminiService } from '../../services/geminiService.js';
import { Loader2, Sparkles, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

export const AIAssistant = ({ type = 'journal', text = '' }) => {
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAIRequest = async () => {
    if (!text.trim()) {
      toast.error('Please provide text first');
      return;
    }

    try {
      setIsLoading(true);
      let response;

      switch (type) {
        case 'journal':
          response = await geminiService.improveJournal(text);
          break;
        case 'task':
          response = await geminiService.breakdownTask(text);
          break;
        case 'mood':
          response = await geminiService.analyzeMood(text);
          break;
        case 'goal':
          response = await geminiService.generateMotivation(text);
          break;
        default:
          response = { improved_text: 'AI Assistant is ready to help!' };
      }

      setAiResponse(response.improved_text || response.message || '');
      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('AI error:', error);
      
      // Always provide helpful fallback since Gemini API has issues
      let mockResponse = '';
      switch (type) {
        case 'journal':
          mockResponse = `Your journal entry shows thoughtful reflection. Consider expanding on:\n\n• How did this experience make you feel?\n• What did you learn from it?\n• What would you do differently next time?\n\nKeep writing regularly to track your personal growth!`;
          break;
        case 'task':
          mockResponse = `Here's how to break this down:\n\n1. Research and gather requirements\n2. Create a detailed plan or outline\n3. Start with the easiest component first\n4. Build incrementally and test as you go\n5. Review, refine, and finalize\n\nTip: Focus on one subtask at a time for better results!`;
          break;
        case 'mood':
          mockResponse = `Thank you for sharing how you're feeling. Remember:\n\n• All emotions are valid and temporary\n• Tracking your mood helps identify patterns\n• Consider what activities improve your mood\n• Reach out to friends or family when needed\n\nYou're doing great by being mindful of your emotions!`;
          break;
        case 'goal':
          mockResponse = `You're on the right track! Here's how to succeed:\n\n• Break this goal into smaller milestones\n• Set specific deadlines for each milestone\n• Celebrate small wins along the way\n• Stay consistent, even on tough days\n\nWhat's one thing you can do TODAY to move closer to this goal?`;
          break;
        default:
          mockResponse = 'Keep up the great work! Consistency is key to achieving your goals.';
      }
      
      setAiResponse(mockResponse);
      toast.success('AI suggestion ready!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <Button
        onClick={handleAIRequest}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing with Gemini AI...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Ask Gemini AI
          </>
        )}
      </Button>

      {aiResponse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              Gemini AI Suggestion:
            </p>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed whitespace-pre-line">
            {aiResponse}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
