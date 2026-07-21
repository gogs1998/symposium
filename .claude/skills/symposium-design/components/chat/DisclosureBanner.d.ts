import * as React from "react";

/** The persistent "AI recreation, not the real person" notice — a quiet ruled strip. */
export interface DisclosureBannerProps {
  figureName?: string;
  /** Compact one-line badge for headers. */
  inline?: boolean;
  style?: React.CSSProperties;
}

export function DisclosureBanner(props: DisclosureBannerProps): JSX.Element;
