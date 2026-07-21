import * as React from "react";

/** The Historical / Creators underline toggle governing the roster. */
export interface CategoryTab { id: string; label: string; }
export interface CategoryTabsProps {
  /** Active tab id. */
  value: string;
  onChange?: (id: string) => void;
  /** Defaults to Historical + Creators. */
  tabs?: CategoryTab[];
  /** Optional per-tab count, keyed by tab id. */
  counts?: Record<string, number>;
  style?: React.CSSProperties;
}

export function CategoryTabs(props: CategoryTabsProps): JSX.Element;
