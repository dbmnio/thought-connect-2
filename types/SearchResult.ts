export interface SearchResult {
  id: string;
  type: 'question' | 'answer' | 'document';
  title: string;
  description: string;
  image_url: string;
  author_name: string;
  team_name: string;
  time_ago: string;
  relevance_score?: number;
} 