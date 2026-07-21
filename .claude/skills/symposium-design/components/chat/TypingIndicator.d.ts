import * as React from "react";

/** The "figure is thinking" state — name rule plus three rising accent dots. */
export interface TypingIndicatorProps {
  /** Figure name (shown on the rule and status line). */
  author?: string;
  accentColor?: string;
  /** Status verb phrase. @default "is composing a reply" */
  label?: string;
  style?: React.CSSProperties;
}

export function TypingIndicator(props: TypingIndicatorProps): JSX.Element;
