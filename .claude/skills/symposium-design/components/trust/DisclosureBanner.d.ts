/** Persistent honesty line: "This is an AI recreation… It is not X." */
export interface DisclosureBannerProps {
  /** omit for the generic product-wide line */
  figureName?: string;
  /** what the recreation is built from, e.g. "published writings", "podcast appearances and videos" */
  basis?: string;
  compact?: boolean;
}
