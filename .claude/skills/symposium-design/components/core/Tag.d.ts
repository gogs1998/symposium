import * as React from "react";

/** Quiet inline label for a figure's category, era, or creator channel. */
export interface TagProps {
  children?: React.ReactNode;
  /** @default "category" */
  kind?: "category" | "era" | "channel";
  /** Override the dot/hue — pass a creator's channel color. */
  accentColor?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function Tag(props: TagProps): JSX.Element;
