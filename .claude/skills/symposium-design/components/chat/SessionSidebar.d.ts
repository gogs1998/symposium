/** Left rail of past sessions. */
export interface SessionSidebarProps {
  sessions?: Array<{ id: string; figure: string; title: string; when: string }>;
  activeId?: string;
  onSelect?: (id: string) => void;
  onNew?: () => void;
}
