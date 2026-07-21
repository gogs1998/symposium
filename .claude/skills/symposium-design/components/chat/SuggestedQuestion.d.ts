import * as React from "react";

/** An opening-question chip for the first-visit empty chat. */
export interface SuggestedQuestionProps {
  children?: React.ReactNode;
  /** Figure accent for the left edge + arrow. */
  accentColor?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function SuggestedQuestion(props: SuggestedQuestionProps): JSX.Element;
