export type Sentiment =
  | 'Enthusiastic'
  | 'Supportive'
  | 'Constructive'
  | 'Neutral'
  | 'Inquisitive'
  | 'Confused'
  | 'Frustrated'
  | 'Critical';

export interface SummaryMetrics {
  total_processed: number;
  high_value_ideas_count: number;
  predominant_sentiment: Sentiment;
}

export interface TopInsight {
  user_id: string;
  original_comment: string;
  summary: string;
  innovation_score: number;
  ip_flag: boolean;
}

export interface AnalysisResult {
  summary_metrics: SummaryMetrics;
  top_insights: TopInsight[];
  automated_response_sample: string;
  lang: string; // e.g., 'en', 'es', 'te'
}