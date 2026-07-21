import * as React from "react";

/**
 * The primary editorial action control for Symposium.
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost / quiet action button" viewport="700x160"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual weight. @default "primary" */
  variant?: "primary" | "secondary" | "ghost" | "quiet";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Leading glyph node. */
  icon?: React.ReactNode;
  /** Trailing glyph node. */
  iconTrailing?: React.ReactNode;
  disabled?: boolean;
  /** Stretch to container width. */
  full?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
