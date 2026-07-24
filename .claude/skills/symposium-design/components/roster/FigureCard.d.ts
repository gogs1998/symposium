/**
 * Roster plaque for one figure or creator.
 * @startingPoint section="Roster" subtitle="Figure plaque with era, corpus fields, availability" viewport="380x260"
 */
export interface FigureCardProps {
  name: string;
  /** e.g. "1879–1955" or "428–348 BCE" — rendered in mono */
  era: string;
  description: string;
  categories?: string[];
  fields?: string[];
  available?: boolean;
  selected?: boolean;
  /** 'historical' | 'creator' — creators get bronze meta */
  kind?: 'historical' | 'creator';
  /** portrait URL; falls back to a monogram */
  portrait?: string;
  onClick?: () => void;
}
