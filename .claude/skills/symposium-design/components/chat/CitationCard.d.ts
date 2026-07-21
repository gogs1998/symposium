import * as React from "react";

/**
 * A single cited source behind an assistant message. The system's signature component,
 * in two variants: a typeset "book" excerpt for historical figures, or a "video" source
 * with thumbnail + clickable timestamp deep-link for creators.
 * @startingPoint section="Chat" subtitle="Book excerpt & video-timestamp citation, both variants" viewport="700x260"
 */
export interface CitationCardProps {
  /** @default "book" */
  variant?: "book" | "video";
  /** The quoted passage / transcript line. */
  excerpt: string;
  /** BOOK: source work name (e.g. "Meditations"). */
  source?: string;
  /** BOOK: locator (e.g. "Book IV, 3"). */
  detail?: string;
  /** Ordinal shown as "Source N". */
  index?: number;
  /** VIDEO: video title. */
  videoTitle?: string;
  /** VIDEO: timestamp string, e.g. "12:34". */
  timestamp?: string;
  /** VIDEO: thumbnail URL (gradient fallback if omitted). */
  thumbnail?: string;
  /** VIDEO: creator channel color for accents. */
  channelColor?: string;
  /** VIDEO: deep-link URL to the moment. */
  href?: string;
  /** VIDEO: click handler for the thumbnail/link. */
  onOpen?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function CitationCard(props: CitationCardProps): JSX.Element;
