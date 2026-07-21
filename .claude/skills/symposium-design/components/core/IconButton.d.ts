import * as React from "react";

/** Square glyph-only control for toolbars and the composer. */
export interface IconButtonProps {
  children?: React.ReactNode;
  /** Accessible label (also the tooltip). */
  label: string;
  /** @default "ghost" */
  variant?: "solid" | "outline" | "ghost";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
