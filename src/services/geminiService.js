// Google Gemini AI Service using official SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

// Initialize Gemini
const initGemini = async () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try different model names in order of preference
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        // Test if model works
        await model.generateContent('test');
        console.log(`Successfully initialized Gemini with model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }
    
    if (!model) {
      throw new Error('No Gemini models are available for your API key');
    }
  }

  return model;
};

export const geminiService = {
  // Generic function to generate content
  generateContent: async (prompt) => {
    try {
      const model = await initGemini();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  },

  // Improve journal entry
  improveJournal: async (text) => {
    const prompt = `As a thoughtful journal coach, analyze this journal entry and provide constructive feedback. Focus on:
1. Emotional depth and self-reflection
2. Clarity and structure
3. Actionable insights
4. Positive reinforcement

Journal Entry:
"${text}"

Provide a brief, encouraging response (2-3 sentences) with specific suggestions for improvement.`;

    const response = await geminiService.generateContent(prompt);
    return { improved_text: response };
  },

  // Break down task into subtasks
  breakdownTask: async (taskDescription) => {
    const prompt = `As a productivity expert, break down this task into 3-5 actionable subtasks:

Task: "${taskDescription}"

Provide a numbered list of clear, specific subtasks that are easy to complete. Keep it concise and practical.`;

    const response = await geminiService.generateContent(prompt);
    return { improved_text: response };
  },

  // Analyze mood patterns
  analyzeMood: async (moodData) => {
    const prompt = `As a wellness coach, analyze this mood entry and provide supportive insights:

Mood: ${moodData}

Provide a brief, empathetic response (2-3 sentences) with:
1. Acknowledgment of their feelings
2. A positive observation or pattern
3. A gentle suggestion for maintaining or improving their mood`;

    const response = await geminiService.generateContent(prompt);
    return { improved_text: response };
  },

  // Generate motivation for goals
  generateMotivation: async (goalData) => {
    const prompt = `As a motivational coach, provide encouragement for this goal:

Goal: "${goalData}"

Write a brief, inspiring message (2-3 sentences) that:
1. Acknowledges the importance of their goal
2. Provides specific encouragement
3. Suggests one actionable step they can take today`;

    const response = await geminiService.generateContent(prompt);
    return { improved_text: response };
  },

  // General chat/question answering
  chat: async (message, context = '') => {
    const prompt = context 
      ? `Context: ${context}\n\nUser: ${message}\n\nProvide a helpful, concise response:`
      : `User: ${message}\n\nProvide a helpful, concise response:`;

    const response = await geminiService.generateContent(prompt);
    return response;
  },
};
