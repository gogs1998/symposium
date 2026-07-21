import * as React from "react";

/** Small uppercase status marker — availability, live/pending states, counts. */
export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: "neutral" | "accent" | "live" | "pending" | "danger";
  /** Prepend a status dot. */
  dot?: boolean;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
