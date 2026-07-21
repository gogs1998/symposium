import * as React from "react";

/**
 * A single figure in the roster grid — portrait, name, one-line description, category and
 * availability. The landing page's hero unit of repetition.
 * @startingPoint section="Figures" subtitle="Roster figure card with availability + accent edge" viewport="700x300"
 */
export interface FigureCardProps {
  name: string;
  description: string;
  /** @default "historical" */
  category?: "historical" | "creator";
  /** Era line or channel name shown as a tag. */
  meta?: string;
  /** Personal accent — era hue or creator channel color. */
  accentColor?: string;
  /** Portrait image URL (monogram fallback if omitted). */
  src?: string;
  /** @default "published" */
  status?: "published" | "coming-soon";
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function FigureCard(props: FigureCardProps): JSX.Element;
