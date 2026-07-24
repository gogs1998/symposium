/**
 * Chat-level chip showing which "voice" (register) a persona draws from, with a nudge menu.
 * @startingPoint section="Chat" subtitle="Register chip + voice nudge menu" viewport="360x300"
 */
export interface RegisterIndicatorProps {
  /** registers this persona has; historical figures usually have only 'written' */
  registers?: Array<'on-camera' | 'conversational' | 'written'>;
  active?: 'on-camera' | 'conversational' | 'written';
  /** called with the register the user nudged toward */
  onNudge?: (register: string) => void;
}
