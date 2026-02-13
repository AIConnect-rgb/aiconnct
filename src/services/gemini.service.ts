import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { AnalysisResult } from '../models/analysis-result.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  private chats = new Map<string, Chat>();

  private readonly systemInstruction = `
    Role:
    You are the AI Connect (AC) Intelligence Engine, a sophisticated mediator between the global public and high-profile entities (CEOs, Celebrities, Government Officials). Your mission is to facilitate "Digital Democracy" by bridging the communication gap.

    Core Objectives:
    - Innovation Mining: Identify high-value, sensational ideas and constructive suggestions.
    - Sentiment Mapping: Provide an overview of the public's emotional pulse.
    - Brain Booster Feedback: Generate intelligent, constructive automated replies to users that encourage them to refine their own ideas.
    - Dashboard Synthesis: Categorize and summarize top ideas for the VIP's dashboard.

    Processing Logic:
    For every user comment, follow these steps:

    1. Internal Analysis (for the Dashboard):
      - Categorize: Classify into [Idea/Suggestion], [Critical Feedback], or [Query].
      - Score: Assign an Innovation Score (1-10) based on originality, feasibility, and impact.
      - IP Flagging: If an idea is highly unique, flag it for "Intellectual Property Protection".
      - Sentiment Analysis: Determine the user's sentiment from the following categories: [Enthusiastic], [Supportive], [Constructive], [Neutral], [Inquisitive], [Confused], [Frustrated], [Critical]. You must select only one from this list.

    2. External Engagement (The User-Facing Reply):
      - This is your MOST IMPORTANT task. Your goal is to act as an intelligent questioner and idea refiner.
      - You must engage in Socratic dialogue. You MUST NOT provide answers, solutions, or personal opinions. Instead, you MUST ask powerful, open-ended questions to help users deepen their own ideas, challenge their assumptions, and consider various angles they may have missed.
      - Craft an "automated_response_sample" that acts as an intelligent, personal follow-up. This response MUST be in the form of clarifying and thought-provoking questions.
      - Example questions: "That's a fascinating starting point. To help me present this effectively, could you elaborate on how you envision the funding model for this initiative?", "What potential roadblocks should we anticipate, and how might we address them?", "Who would be the key stakeholders to get on board for this to succeed?"

    Constraints & Tone:
    - Language: You MUST detect the user's language (especially English and Telugu), respond in their native tongue, and include the two-letter ISO 639-1 code in the 'lang' field of your JSON output.
    - Objectivity: Remain strictly neutral. Do not suppress criticism if it is constructive.
    - Conciseness: VIP summaries must be actionable and "glanceable."
    - Tone: Professional, exceptionally polite, encouraging, and intellectually curious.

    Output Format:
    You MUST provide your complete output in the specified JSON format. The \`automated_response_sample\` is the key user-facing element.
  `;

  private readonly responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary_metrics: {
        type: Type.OBJECT,
        properties: {
          total_processed: { type: Type.INTEGER, description: 'Total number of comments processed (should be 1 for a single input).' },
          high_value_ideas_count: { type: Type.INTEGER, description: 'Number of high-value ideas identified.' },
          predominant_sentiment: { type: Type.STRING, description: 'The main sentiment detected.' },
        },
        required: ['total_processed', 'high_value_ideas_count', 'predominant_sentiment']
      },
      top_insights: {
        type: Type.ARRAY,
        description: 'A list of the top insights found in the comment.',
        items: {
          type: Type.OBJECT,
          properties: {
            user_id: { type: Type.STRING, description: "A placeholder user ID, e.g., 'user_001'." },
            original_comment: { type: Type.STRING, description: 'The original comment provided by the user.' },
            summary: { type: Type.STRING, description: 'A concise summary of the core idea or feedback for internal review.' },
            innovation_score: { type: Type.INTEGER, description: 'A score from 1-10 for innovation.' },
            ip_flag: { type: Type.BOOLEAN, description: 'Flag for potential intellectual property.' },
          },
          required: ['user_id', 'original_comment', 'summary', 'innovation_score', 'ip_flag']
        },
      },
      automated_response_sample: {
        type: Type.STRING,
        description: 'A Socratic, question-based response designed to help the user refine their idea. This is a personal follow-up from the "Chief of Staff".'
      },
      lang: { 
        type: Type.STRING, 
        description: 'The detected two-letter ISO 639-1 language code of the original comment (e.g., "en", "es", "te").'
      },
    },
    required: ['summary_metrics', 'top_insights', 'automated_response_sample', 'lang']
  };

  async analyzeContent(prompt: string): Promise<AnalysisResult> {
    if (!prompt) {
      throw new Error('Input content cannot be empty.');
    }

    // Clear any previous chat session for a new analysis
    this.chats.forEach((_, key) => {
        if (key.startsWith('temp_')) { // Heuristic to clear chat for new posts
            this.chats.delete(key);
        }
    });

    let response: GenerateContentResponse;
    try {
      response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: this.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: this.responseSchema,
          temperature: 0.5,
        },
      });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.toLowerCase().includes('api key not valid')) {
          throw new Error('There seems to be an issue with the API configuration. Please contact support if this persists.');
        }
        if (error.message.toLowerCase().includes('safety')) {
            throw new Error('The request was blocked due to safety settings. Please modify your input.');
        }
      }
      throw new Error("Could not connect to the AI service. Please check your internet connection and try again.");
    }

    try {
      const jsonText = response.text.trim();
      if (!jsonText) {
          throw new Error("The AI returned an empty response. Please try modifying your prompt.");
      }
      return JSON.parse(jsonText) as AnalysisResult;
    } catch (error) {
      console.error("Error parsing Gemini JSON response:", error, `Raw response: "${response?.text}"`);
      throw new Error("The AI's response was not in the expected format. This can happen with complex requests. Please try again.");
    }
  }

  async sendMessage(postId: string, message: string, initialAiMessage: string): Promise<GenerateContentResponse> {
    let chat = this.chats.get(postId);

    if (!chat) {
        const chatSystemInstruction = `You are the AI Connect (AC) Intelligence Engine, continuing a conversation with a citizen. Your sole purpose is to remain an intelligent questioner. Never provide answers or opinions. Your entire dialogue must consist of asking insightful, Socratic questions to help the user refine their suggestion and think more deeply. Maintain a professional, encouraging, and curious tone. Respond in the user's native language.`;
        chat = this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: chatSystemInstruction },
            history: [{ role: 'model', parts: [{ text: initialAiMessage }] }]
        });
        this.chats.set(postId, chat);
    }
    
    return await chat.sendMessage({ message });
  }

  async correctText(text: string, lang: string): Promise<string> {
    if (!text.trim()) {
        return text;
    }

    const langName = lang === 'te' ? 'Telugu' : 'English';
    const prompt = `Please correct any spelling and grammar mistakes in the following ${langName} text. Return only the corrected text, without any additional explanations or introductory phrases.\n\nOriginal text:\n"${text}"`;
    
    try {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 },
                temperature: 0.2,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for text correction:", error);
        return text; // Return original text on failure
    }
  }
}