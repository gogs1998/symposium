/** Underlined tab row for roster categories (Historical, Creators, …). */
export interface CategoryTabsProps {
  tabs: string[];
  active: string;
  onChange?: (tab: string) => void;
  /** optional per-tab counts rendered in mono */
  counts?: Record<string, number>;
}
