import React from "react";

/**
 * CitationCard — the system's most distinctive component. Renders a single source behind
 * an assistant message, in one of two variants:
 *   - "book": a typeset excerpt with a citation line (work, chapter/page). Reads like a
 *     margin quotation from a catalog — serif excerpt, hanging quotation mark, source rule.
 *   - "video": a creator source. Thumbnail with a timestamp chip; the source line is a
 *     clickable "said in {Title} @ {time}" that deep-links to the moment.
 */
export function CitationCard({
  variant = "book",
  excerpt,
  source,
  detail,
  index,
  // video-only:
  videoTitle,
  timestamp,
  thumbnail,
  channelColor,
  href,
  onOpen,
  style,
  ...rest
}) {
  const isVideo = variant === "video";
  return (
    <figure
      className={`sym-citation sym-citation--${variant}`}
      style={{
        margin: 0,
        display: "flex",
        flexDirection: isVideo ? "row" : "column",
        gap: isVideo ? "var(--space-4)" : "var(--space-3)",
        padding: "var(--space-4)",
        background: "var(--surface-page)",
        border: "1px solid var(--border-line)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-xs)",
        ...style,
      }}
      {...rest}
    >
      {isVideo ? (
        <>
          <button
            onClick={onOpen}
            aria-label={`Open ${videoTitle} at ${timestamp}`}
            style={{
              position: "relative",
              flex: "none",
              width: 148,
              aspectRatio: "16 / 9",
              border: "1px solid var(--border-line)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              padding: 0,
              cursor: "pointer",
              background: thumbnail ? "var(--paper-2)" : "var(--ink-1)",
            }}
          >
            {thumbnail ? (
              <img src={thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${channelColor || "var(--ink-1)"} 0%, var(--ink-0) 100%)`, opacity: 0.85 }} />
            )}
            {/* play glyph */}
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(20,17,12,0.62)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, paddingLeft: 2 }}>▶</span>
            </span>
            <span style={{ position: "absolute", right: 6, bottom: 6, padding: "2px 6px", background: "rgba(20,17,12,0.82)", color: "#F3ECDD", font: "var(--fw-medium) var(--text-2xs)/1 var(--font-mono)", borderRadius: "var(--radius-xs)" }}>
              {timestamp}
            </span>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            {index != null && <span className="sym-eyebrow" style={{ color: "var(--text-faint)" }}>Source {index}</span>}
            <p style={{ margin: 0, font: "var(--fw-regular) var(--text-base)/1.5 var(--font-serif)", color: "var(--text-body)", textWrap: "pretty" }}>
              “{excerpt}”
            </p>
            <a
              href={href || "#"}
              onClick={onOpen}
              className="sym-citation-link"
              style={{ font: "var(--fw-medium) var(--text-sm)/1.4 var(--font-mono)", color: "var(--link)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: channelColor || "var(--accent)", flex: "none" }} />
              said in {videoTitle} @ {timestamp}
            </a>
          </div>
        </>
      ) : (
        <>
          {index != null && <span className="sym-eyebrow" style={{ color: "var(--text-faint)" }}>Source {index}</span>}
          <blockquote style={{ margin: 0, position: "relative", paddingLeft: "var(--space-5)" }}>
            <span aria-hidden style={{ position: "absolute", left: 0, top: -6, font: "var(--fw-regular) 42px/1 var(--font-display)", color: "var(--accent)" }}>“</span>
            <p style={{ margin: 0, font: "var(--fw-regular) var(--text-md)/1.6 var(--font-serif)", fontStyle: "italic", color: "var(--text-strong)", textWrap: "pretty" }}>
              {excerpt}
            </p>
          </blockquote>
          <figcaption style={{ display: "flex", alignItems: "baseline", gap: "8px", paddingTop: "var(--space-2)", borderTop: "1px solid var(--border-hair)" }}>
            <cite style={{ font: "var(--fw-semibold) var(--text-sm)/1.3 var(--font-sans)", color: "var(--text-body)", fontStyle: "normal" }}>
              {source}
            </cite>
            {detail && <span style={{ font: "var(--fw-regular) var(--text-sm)/1.3 var(--font-mono)", color: "var(--text-muted)" }}>{detail}</span>}
          </figcaption>
        </>
      )}
    </figure>
  );
}
