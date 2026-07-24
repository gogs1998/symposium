/**
 * Slide-in trust surface: the figure's corpus at a glance, the grounding explanation, the ethics note.
 * @startingPoint section="Trust" subtitle="Corpus catalogue + grounding + ethics panel" viewport="420x640"
 */
export interface SourcesPanelProps {
  figureName: string;
  /** what the recreation is built from, for the ethics note */
  basis?: string;
  /** mono summary line, e.g. "6 works · 2,140 pages · ingested 2026-03-14" */
  totals?: string;
  books?: Array<{ title: string; year?: string; size: string }>;
  videos?: Array<{ title: string; duration: string; date?: string; thumbnail?: string }>;
  collections?: Array<{ title: string; size: string }>;
  onClose?: () => void;
}
