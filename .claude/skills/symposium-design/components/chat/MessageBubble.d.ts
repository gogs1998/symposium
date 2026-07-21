import * as React from "react";
import type { CitationCardProps } from "./CitationCard";

/**
 * One conversation turn. User turns are quiet right-aligned ink-on-paper; assistant turns
 * read as a passage from the figure with a name rule and an expandable citations tray.
 * @startingPoint section="Chat" subtitle="User + assistant turns with expandable citations" viewport="700x360"
 */
export interface MessageBubbleProps {
  /** @default "assistant" */
  role?: "user" | "assistant";
  /** Assistant only — the figure's name shown above the passage. */
  author?: string;
  /** Assistant name-dot / caret accent. */
  accentColor?: string;
  children?: React.ReactNode;
  /** Sources to reveal under the message. */
  citations?: CitationCardProps[];
  /** Render the streaming caret; hides the citations toggle. */
  streaming?: boolean;
  /** Start with the citations tray open. */
  defaultOpen?: boolean;
  style?: React.CSSProperties;
}

export function MessageBubble(props: MessageBubbleProps): JSX.Element;
