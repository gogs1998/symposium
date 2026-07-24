/** Chat input bar with SEND plaque button. */
export interface ComposerProps {
  /** e.g. "Ask Charles Darwin anything…" */
  placeholder?: string;
  disabled?: boolean;
  onSend?: (text: string) => void;
}
