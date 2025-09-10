// Shared TypeScript types for SpeedThreads

export interface ThreadData {
  platform: 'reddit' | 'x';
  post: {
    title?: string;
    text: string;
    author?: string;
    upvotes?: number;
    url?: string;
  };
  replies: Array<{
    text: string;
    author?: string;
    upvotes?: number;
    isTopLevel?: boolean;
  }>;
}

export interface SummaryResponse {
  type: 'question' | 'humor' | 'advice' | 'discussion' | 'other';
  tldr: string;
  summary: string[];
  best_answer?: string;
  controversial?: string;
  funny?: string;
  suggested_reply?: string;
}

export interface ApiError {
  error: string;
  message: string;
  code?: number;
}
