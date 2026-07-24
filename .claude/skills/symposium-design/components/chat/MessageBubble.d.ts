import { ReactNode } from 'react';
/** Chat message: 'assistant' manuscript plaque with optional citations, 'user' ink plaque, 'system' mono caption. */
export interface MessageBubbleProps {
  role?: 'assistant' | 'user' | 'system';
  /** figure name, shown above assistant replies in Marcellus */
  author?: string;
  /** which voice the reply draws from */
  register?: 'on-camera' | 'conversational' | 'written';
  children?: ReactNode;
  /** CitationCard nodes, rendered under a double rule */
  citations?: ReactNode[];
}
