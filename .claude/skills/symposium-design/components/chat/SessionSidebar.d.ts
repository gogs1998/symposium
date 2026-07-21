import * as React from "react";

/**
 * The conversation-history rail — a list of sessions with figure dot, title, and last-active
 * line, plus a New-conversation action.
 * @startingPoint section="Chat" subtitle="Conversation history sidebar" viewport="320x520"
 */
export interface SessionItem {
  id: string;
  title: string;
  /** Figure name shown on the meta line. */
  figure?: string;
  /** Last-active label, e.g. "2h ago". */
  time?: string;
  /** Figure accent dot. */
  accentColor?: string;
}
export interface SessionSidebarProps {
  sessions: SessionItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNew?: () => void;
  /** Section label. @default "Conversations" */
  header?: string;
  style?: React.CSSProperties;
}

export function SessionSidebar(props: SessionSidebarProps): JSX.Element;
