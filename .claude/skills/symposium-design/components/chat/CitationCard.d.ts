/** Source citation under a reply. Book: title + locator + excerpt. Video: thumbnail + timestamp deep-link. */
export interface CitationCardProps {
  type?: 'book' | 'video';
  /** work title, italicized: "On the Origin of Species", "JRE #1169" */
  title: string;
  /** "ch. 4", "p. 212" */
  locator?: string;
  /** quoted retrieval excerpt, clamped to 2 lines */
  excerpt?: string;
  /** video deep-link timestamp "01:14:32" */
  timestamp?: string;
  /** publish date for videos */
  date?: string;
  thumbnail?: string;
  href?: string;
  onClick?: () => void;
}
