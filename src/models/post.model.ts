import { AnalysisResult } from './analysis-result.model';

export interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  text: string;
  replyingToText?: string;
}

export interface Post {
  id: string;
  author: string;
  handle: string;
  avatarUrl: string;
  timestamp: Date;
  text: string;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
}