import * as React from "react";

/**
 * The message input — auto-sizing textarea, accent send control, and a persistent
 * AI-recreation disclosure. Enter sends, Shift+Enter newlines.
 * @startingPoint section="Chat" subtitle="Message composer with recreation disclosure" viewport="700x160"
 */
export interface ComposerProps {
  value: string;
  onChange?: (v: string) => void;
  onSend?: (v: string) => void;
  placeholder?: string;
  /** Personalizes placeholder + disclosure copy. */
  figureName?: string;
  /** Streaming in progress — disables send. */
  busy?: boolean;
  /** Show the AI-recreation disclosure line. @default true */
  disclosure?: boolean;
  style?: React.CSSProperties;
}

export function Composer(props: ComposerProps): JSX.Element;
