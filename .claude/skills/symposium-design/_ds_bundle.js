/* @ds-bundle: {"format":4,"namespace":"SymposiumDesignSystem_32eaa4","components":[{"name":"CitationCard","sourcePath":"components/chat/CitationCard.jsx"},{"name":"Composer","sourcePath":"components/chat/Composer.jsx"},{"name":"DisclosureBanner","sourcePath":"components/chat/DisclosureBanner.jsx"},{"name":"MessageBubble","sourcePath":"components/chat/MessageBubble.jsx"},{"name":"SessionSidebar","sourcePath":"components/chat/SessionSidebar.jsx"},{"name":"SuggestedQuestion","sourcePath":"components/chat/SuggestedQuestion.jsx"},{"name":"TypingIndicator","sourcePath":"components/chat/TypingIndicator.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"CategoryTabs","sourcePath":"components/figures/CategoryTabs.jsx"},{"name":"FigureCard","sourcePath":"components/figures/FigureCard.jsx"},{"name":"FigurePortrait","sourcePath":"components/figures/FigurePortrait.jsx"}],"sourceHashes":{"components/chat/CitationCard.jsx":"cd09e95d2409","components/chat/Composer.jsx":"a22393a27ddb","components/chat/DisclosureBanner.jsx":"b6d68b397c94","components/chat/MessageBubble.jsx":"b8c947a91581","components/chat/SessionSidebar.jsx":"fc018eaa24fe","components/chat/SuggestedQuestion.jsx":"afdcbf8faa19","components/chat/TypingIndicator.jsx":"6f3134e0e63a","components/core/Badge.jsx":"de934be88219","components/core/Button.jsx":"21f1297e176b","components/core/IconButton.jsx":"3b2b55ca6e99","components/core/Tag.jsx":"615b8f6c3d25","components/figures/CategoryTabs.jsx":"aaa7ceec9022","components/figures/FigureCard.jsx":"b65031dba06c","components/figures/FigurePortrait.jsx":"fdcc2ac00182","ui_kits/symposium-app/App.jsx":"99961b09c5d2","ui_kits/symposium-app/ChatScreen.jsx":"a3705baee075","ui_kits/symposium-app/RosterScreen.jsx":"1c5f2200b63c","ui_kits/symposium-app/data.js":"b841e2e196e4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SymposiumDesignSystem_32eaa4 = window.SymposiumDesignSystem_32eaa4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chat/CitationCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CitationCard — the system's most distinctive component. Renders a single source behind
 * an assistant message, in one of two variants:
 *   - "book": a typeset excerpt with a citation line (work, chapter/page). Reads like a
 *     margin quotation from a catalog — serif excerpt, hanging quotation mark, source rule.
 *   - "video": a creator source. Thumbnail with a timestamp chip; the source line is a
 *     clickable "said in {Title} @ {time}" that deep-links to the moment.
 */
function CitationCard({
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
  return /*#__PURE__*/React.createElement("figure", _extends({
    className: `sym-citation sym-citation--${variant}`,
    style: {
      margin: 0,
      display: "flex",
      flexDirection: isVideo ? "row" : "column",
      gap: isVideo ? "var(--space-4)" : "var(--space-3)",
      padding: "var(--space-4)",
      background: "var(--surface-page)",
      border: "1px solid var(--border-line)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-xs)",
      ...style
    }
  }, rest), isVideo ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: onOpen,
    "aria-label": `Open ${videoTitle} at ${timestamp}`,
    style: {
      position: "relative",
      flex: "none",
      width: 148,
      aspectRatio: "16 / 9",
      border: "1px solid var(--border-line)",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      padding: 0,
      cursor: "pointer",
      background: thumbnail ? "var(--paper-2)" : "var(--ink-1)"
    }
  }, thumbnail ? /*#__PURE__*/React.createElement("img", {
    src: thumbnail,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: `linear-gradient(135deg, ${channelColor || "var(--ink-1)"} 0%, var(--ink-0) 100%)`,
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "rgba(20,17,12,0.62)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 13,
      paddingLeft: 2
    }
  }, "\u25B6")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 6,
      bottom: 6,
      padding: "2px 6px",
      background: "rgba(20,17,12,0.82)",
      color: "#F3ECDD",
      font: "var(--fw-medium) var(--text-2xs)/1 var(--font-mono)",
      borderRadius: "var(--radius-xs)"
    }
  }, timestamp)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      minWidth: 0
    }
  }, index != null && /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow",
    style: {
      color: "var(--text-faint)"
    }
  }, "Source ", index), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--text-base)/1.5 var(--font-serif)",
      color: "var(--text-body)",
      textWrap: "pretty"
    }
  }, "\u201C", excerpt, "\u201D"), /*#__PURE__*/React.createElement("a", {
    href: href || "#",
    onClick: onOpen,
    className: "sym-citation-link",
    style: {
      font: "var(--fw-medium) var(--text-sm)/1.4 var(--font-mono)",
      color: "var(--link)",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: channelColor || "var(--accent)",
      flex: "none"
    }
  }), "said in ", videoTitle, " @ ", timestamp))) : /*#__PURE__*/React.createElement(React.Fragment, null, index != null && /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow",
    style: {
      color: "var(--text-faint)"
    }
  }, "Source ", index), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      position: "relative",
      paddingLeft: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      left: 0,
      top: -6,
      font: "var(--fw-regular) 42px/1 var(--font-display)",
      color: "var(--accent)"
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--text-md)/1.6 var(--font-serif)",
      fontStyle: "italic",
      color: "var(--text-strong)",
      textWrap: "pretty"
    }
  }, excerpt)), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "8px",
      paddingTop: "var(--space-2)",
      borderTop: "1px solid var(--border-hair)"
    }
  }, /*#__PURE__*/React.createElement("cite", {
    style: {
      font: "var(--fw-semibold) var(--text-sm)/1.3 var(--font-sans)",
      color: "var(--text-body)",
      fontStyle: "normal"
    }
  }, source), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-sm)/1.3 var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, detail))));
}
Object.assign(__ds_scope, { CitationCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/CitationCard.jsx", error: String((e && e.message) || e) }); }

// components/chat/DisclosureBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * DisclosureBanner — the persistent "AI recreation, not the real person" notice. A quiet
 * ruled strip, not an alert. `inline` renders a compact one-line version for headers.
 */
function DisclosureBanner({
  figureName,
  inline = false,
  style,
  ...rest
}) {
  if (inline) {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: "sym-disclosure sym-disclosure--inline",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        font: "var(--fw-medium) var(--text-xs)/1 var(--font-sans)",
        color: "var(--text-faint)",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "var(--text-faint)"
      }
    }), "AI recreation");
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sym-disclosure",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px var(--space-4)",
      background: "var(--surface-sunken)",
      borderTop: "1px solid var(--border-hair)",
      borderBottom: "1px solid var(--border-hair)",
      font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-sans)",
      color: "var(--text-muted)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-faint)"
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      textWrap: "pretty"
    }
  }, "You\u2019re speaking with an AI recreation of ", figureName || "this figure", ", grounded in their own words. It is not the real person, and every claim is cited to a source."));
}
Object.assign(__ds_scope, { DisclosureBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/DisclosureBanner.jsx", error: String((e && e.message) || e) }); }

// components/chat/MessageBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MessageBubble — one turn in the conversation. User turns are quiet ink-on-paper aligned
 * right; assistant turns read like a passage from the figure, left-aligned with a name rule
 * and an expandable citations tray. Set `streaming` to render the in-progress caret.
 */
function MessageBubble({
  role = "assistant",
  author,
  accentColor,
  children,
  citations = [],
  streaming = false,
  defaultOpen = false,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isUser = role === "user";
  if (isUser) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "flex",
        justifyContent: "flex-end",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "80%",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--paper-3)",
        border: "1px solid var(--border-line)",
        borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
        font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)",
        color: "var(--text-strong)",
        textWrap: "pretty"
      }
    }, children));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sym-message",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, rest), author && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: accentColor || "var(--accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-md)/1 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, author), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border-hair)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-regular) var(--text-lg)/1.68 var(--font-serif)",
      color: "var(--text-body)",
      textWrap: "pretty",
      maxWidth: "var(--measure-reading)"
    }
  }, children, streaming && /*#__PURE__*/React.createElement("span", {
    className: "sym-caret",
    style: {
      display: "inline-block",
      width: "0.5ch",
      height: "1.05em",
      marginLeft: "2px",
      background: "var(--accent)",
      verticalAlign: "-0.12em",
      animation: "sym-blink 1s steps(2) infinite"
    }
  })), citations.length > 0 && !streaming && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    className: "sym-cite-toggle",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "5px 12px 5px 10px",
      background: open ? "var(--accent-soft)" : "transparent",
      border: `1px solid ${open ? "var(--accent-border)" : "var(--border-line)"}`,
      borderRadius: "var(--radius-pill)",
      cursor: "pointer",
      font: "var(--fw-semibold) var(--text-xs)/1 var(--font-sans)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: open ? "var(--accent-press)" : "var(--text-muted)",
      transition: "all var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)"
    }
  }, citations.length), citations.length === 1 ? "Source" : "Sources", /*#__PURE__*/React.createElement("span", {
    style: {
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform var(--dur-fast) var(--ease-out)",
      fontSize: 9
    }
  }, "\u25BE")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      marginTop: "var(--space-3)",
      maxWidth: "var(--measure-reading)"
    }
  }, citations.map((c, i) => /*#__PURE__*/React.createElement(__ds_scope.CitationCard, _extends({
    key: i,
    index: i + 1
  }, c))))));
}
Object.assign(__ds_scope, { MessageBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/MessageBubble.jsx", error: String((e && e.message) || e) }); }

// components/chat/SessionSidebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SessionSidebar — the conversation history rail. Groups sessions by figure or recency,
 * each row showing a figure dot, title, and last-active line. A "New conversation" action
 * sits at the top. `activeId` highlights the current session.
 */
function SessionSidebar({
  sessions = [],
  activeId,
  onSelect,
  onNew,
  header = "Conversations",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    className: "sym-sidebar",
    style: {
      width: "var(--sidebar-w)",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-page)",
      borderRight: "1px solid var(--border-line)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--space-5) var(--space-5) var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow"
  }, header), /*#__PURE__*/React.createElement("button", {
    onClick: onNew,
    "aria-label": "New conversation",
    style: {
      width: 28,
      height: 28,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid var(--border-line)",
      borderRadius: "var(--radius-sm)",
      background: "var(--surface-card)",
      color: "var(--text-body)",
      cursor: "pointer",
      fontSize: 16,
      lineHeight: 1
    }
  }, "+")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "0 var(--space-3) var(--space-4)"
    }
  }, sessions.map(s => {
    const active = s.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => onSelect && onSelect(s.id),
      className: "sym-session-row",
      style: {
        width: "100%",
        textAlign: "left",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        padding: "var(--space-3)",
        marginBottom: "2px",
        border: "1px solid " + (active ? "var(--border-line)" : "transparent"),
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--surface-card)" : "transparent",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        marginTop: 6,
        borderRadius: "50%",
        background: s.accentColor || "var(--ink-3)",
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "2px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--fw-medium) var(--text-base)/1.3 var(--font-sans)",
        color: active ? "var(--text-strong)" : "var(--text-body)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, s.title), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--fw-regular) var(--text-xs)/1.3 var(--font-sans)",
        color: "var(--text-faint)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, s.figure, s.figure && s.time ? " · " : "", s.time)));
  })));
}
Object.assign(__ds_scope, { SessionSidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/SessionSidebar.jsx", error: String((e && e.message) || e) }); }

// components/chat/SuggestedQuestion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SuggestedQuestion — an opening-question chip for the empty chat. Serif prompt with a
 * quiet arrow; hover lifts the accent edge. Used in a stacked list on first visit.
 */
function SuggestedQuestion({
  children,
  accentColor,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    className: "sym-suggested",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      width: "100%",
      textAlign: "left",
      padding: "var(--space-4) var(--space-5)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-line)",
      borderLeft: `3px solid ${accentColor || "var(--border-line)"}`,
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      font: "var(--fw-regular) var(--text-lg)/1.4 var(--font-serif)",
      color: "var(--text-strong)",
      transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
      textWrap: "pretty",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      color: accentColor || "var(--accent)",
      fontSize: 18,
      flex: "none"
    }
  }, "\u2192"));
}
Object.assign(__ds_scope, { SuggestedQuestion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/SuggestedQuestion.jsx", error: String((e && e.message) || e) }); }

// components/chat/TypingIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TypingIndicator — the "figure is thinking" state. A name rule matching MessageBubble,
 * then three rising dots in the figure's accent and a quiet status line.
 */
function TypingIndicator({
  author,
  accentColor,
  label = "is composing a reply",
  style,
  ...rest
}) {
  const dot = i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: accentColor || "var(--accent)",
      display: "inline-block",
      animation: "sym-thinking 1.3s var(--ease-in-out) infinite",
      animationDelay: `${i * 0.16}s`
    }
  });
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sym-typing",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, rest), author && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: accentColor || "var(--accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-md)/1 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, author), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border-hair)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: "5px",
      alignItems: "flex-end",
      height: 12
    }
  }, [0, 1, 2].map(dot)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-sm)/1 var(--font-sans)",
      fontStyle: "italic",
      color: "var(--text-muted)"
    }
  }, author ? `${author} ${label}` : label)));
}
Object.assign(__ds_scope, { TypingIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/TypingIndicator.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — small status marker. Used for availability ("Published" / "Coming soon")
 * and counts. Tones map to semantic colors; `dot` prepends a status dot.
 */
function Badge({
  children,
  tone = "neutral",
  dot = false,
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      bg: "var(--paper-3)",
      fg: "var(--text-muted)",
      dc: "var(--ink-3)"
    },
    accent: {
      bg: "var(--accent-soft)",
      fg: "var(--accent-press)",
      dc: "var(--accent)"
    },
    live: {
      bg: "var(--success-soft)",
      fg: "var(--success)",
      dc: "var(--success)"
    },
    pending: {
      bg: "var(--warning-soft)",
      fg: "var(--warning)",
      dc: "var(--warning)"
    },
    danger: {
      bg: "var(--danger-soft)",
      fg: "var(--danger)",
      dc: "var(--danger)"
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sym-badge sym-badge--${tone}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "3px 9px",
      background: tones.bg,
      color: tones.fg,
      font: "var(--fw-semibold) var(--text-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      borderRadius: "var(--radius-pill)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: tones.dc,
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the primary editorial action control.
 * Variants: primary (cinnabar), secondary (ink outline), ghost, quiet.
 * Sizes: sm | md | lg. Optional leading/trailing glyph via `icon` / `iconTrailing`.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconTrailing,
  disabled = false,
  full = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      h: "var(--control-sm)",
      px: "12px",
      fs: "var(--text-sm)"
    },
    md: {
      h: "var(--control-md)",
      px: "18px",
      fs: "var(--text-base)"
    },
    lg: {
      h: "var(--control-lg)",
      px: "26px",
      fs: "var(--text-md)"
    }
  }[size];
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--text-on-accent)",
      border: "1px solid var(--accent)",
      boxShadow: "var(--shadow-xs)"
    },
    secondary: {
      background: "transparent",
      color: "var(--text-strong)",
      border: "1.5px solid var(--ink-0)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-body)",
      border: "1px solid var(--border-line)"
    },
    quiet: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: `sym-btn sym-btn--${variant}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      height: sizes.h,
      padding: `0 ${sizes.px}`,
      width: full ? "100%" : "auto",
      font: `var(--fw-semibold) ${sizes.fs}/1 var(--font-sans)`,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
      whiteSpace: "nowrap",
      ...variants,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      fontSize: "1.1em"
    }
  }, icon), children, iconTrailing && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      fontSize: "1.1em"
    }
  }, iconTrailing));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square, glyph-only control. For toolbar / composer actions.
 * Variants: solid (accent), outline, ghost. Sizes: sm | md | lg.
 */
function IconButton({
  children,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const dim = {
    sm: 30,
    md: 38,
    lg: 46
  }[size];
  const variants = {
    solid: {
      background: "var(--accent)",
      color: "var(--text-on-accent)",
      border: "1px solid var(--accent)"
    },
    outline: {
      background: "var(--surface-card)",
      color: "var(--text-strong)",
      border: "1px solid var(--border-line)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    className: `sym-iconbtn sym-iconbtn--${variant}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      fontSize: dim * 0.46,
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      ...variants,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/chat/Composer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Composer — the message input. Auto-sizing textarea, an accent send control, and a
 * persistent hairline disclosure that this is an AI recreation. `busy` disables send and
 * swaps the label. Enter sends; Shift+Enter newlines.
 */
function Composer({
  value,
  onChange,
  onSend,
  placeholder = "Write to the figure…",
  figureName,
  busy = false,
  disclosure = true,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);
  const submit = () => {
    if (busy || !value || !value.trim()) return;
    onSend && onSend(value);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sym-composer",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-3) var(--space-3) var(--space-4)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-line)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      transition: "border-color var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    ref: ref,
    rows: 1,
    value: value,
    placeholder: figureName ? `Write to ${figureName}…` : placeholder,
    onChange: e => onChange && onChange(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    style: {
      flex: 1,
      resize: "none",
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)",
      color: "var(--text-strong)",
      maxHeight: 200,
      padding: "6px 0"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    label: busy ? "Sending" : "Send",
    variant: "solid",
    size: "md",
    disabled: busy || !value || !value.trim(),
    onClick: submit
  }, busy ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, "\u25E6") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      transform: "translateX(-1px)"
    }
  }, "\u2191"))), disclosure && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: "center",
      font: "var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)",
      color: "var(--text-faint)"
    }
  }, "An AI recreation grounded in ", figureName ? `${figureName}’s` : "the figure’s", " own words \u2014 not the real person. Responses may err."));
}
Object.assign(__ds_scope, { Composer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/Composer.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — a quiet inline label for category, era, or channel. More editorial than Badge:
 * mixed-case serif/sans, optional accent color hook for a creator's channel color.
 * `accentColor` overrides the dot + text hue (used for creator channel colors).
 */
function Tag({
  children,
  kind = "category",
  accentColor,
  onClick,
  style,
  ...rest
}) {
  const interactive = !!onClick;
  const base = {
    category: {
      border: "var(--border-line)",
      color: "var(--text-muted)"
    },
    era: {
      border: "var(--indigo-200)",
      color: "var(--indigo-500)"
    },
    channel: {
      border: "var(--border-line)",
      color: "var(--text-muted)"
    }
  }[kind];
  const hue = accentColor || (kind === "era" ? "var(--indigo-500)" : "var(--ink-3)");
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    role: interactive ? "button" : undefined,
    className: `sym-tag sym-tag--${kind}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "2px 10px 3px",
      border: `1px solid ${base.border}`,
      color: base.color,
      background: "transparent",
      font: "var(--fw-medium) var(--text-xs)/1.3 var(--font-sans)",
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-pill)",
      cursor: interactive ? "pointer" : "default",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: hue,
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/figures/CategoryTabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CategoryTabs — the Historical / Creators toggle that governs the roster. Editorial
 * underline-tab treatment (not pills). `counts` optionally shows per-tab totals.
 */
function CategoryTabs({
  value,
  onChange,
  tabs,
  counts = {},
  style,
  ...rest
}) {
  const items = tabs || [{
    id: "historical",
    label: "Historical"
  }, {
    id: "creator",
    label: "Creators"
  }];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    className: "sym-tabs",
    style: {
      display: "inline-flex",
      gap: "var(--space-7)",
      borderBottom: "1px solid var(--border-line)",
      ...style
    }
  }, rest), items.map(t => {
    const active = t.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(t.id),
      className: "sym-tab",
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "baseline",
        gap: "8px",
        padding: "0 2px 14px",
        marginBottom: "-1px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: active ? "var(--text-strong)" : "var(--text-muted)",
        font: `var(--fw-regular) var(--text-xl)/1 var(--font-display)`,
        transition: "color var(--dur-fast) var(--ease-out)"
      }
    }, t.label, counts[t.id] != null && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--fw-medium) var(--text-sm)/1 var(--font-mono)",
        color: active ? "var(--accent)" : "var(--text-faint)"
      }
    }, counts[t.id]), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: active ? "var(--accent)" : "transparent",
        transition: "background var(--dur-med) var(--ease-out)"
      }
    }));
  }));
}
Object.assign(__ds_scope, { CategoryTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/figures/CategoryTabs.jsx", error: String((e && e.message) || e) }); }

// components/figures/FigurePortrait.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FigurePortrait — a figure's likeness. Accepts an image `src`; when absent, renders a
 * dignified typographic monogram plate (initials in display serif over a warm plate that
 * carries a subtle personal accent — an era tint for historical figures, the channel color
 * for creators). Shape: portrait (default), square, or round.
 */
function FigurePortrait({
  src,
  name = "",
  accentColor,
  category = "historical",
  shape = "portrait",
  size = 96,
  grain = true,
  style,
  ...rest
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const ratio = {
    portrait: 4 / 5,
    square: 1,
    round: 1
  }[shape];
  const w = size;
  const h = shape === "portrait" ? Math.round(size / ratio) : size;
  const radius = shape === "round" ? "50%" : "var(--radius-sm)";
  const plate = accentColor ? `color-mix(in oklab, ${accentColor} 16%, var(--paper-2))` : category === "creator" ? "var(--paper-2)" : "var(--indigo-100)";
  const ink = accentColor ? `color-mix(in oklab, ${accentColor} 62%, var(--ink-0))` : category === "creator" ? "var(--ink-1)" : "var(--indigo-500)";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sym-portrait",
    style: {
      position: "relative",
      width: w,
      height: h,
      borderRadius: radius,
      overflow: "hidden",
      background: src ? "var(--paper-2)" : plate,
      border: "1px solid var(--border-line)",
      boxShadow: "var(--shadow-inset)",
      flex: "none",
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      filter: "saturate(0.92) contrast(1.02)"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: `var(--fw-regular) ${Math.round(size * 0.42)}px/1 var(--font-display)`,
      color: ink,
      letterSpacing: "0.01em"
    }
  }, initials || "—"), grain && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "var(--texture-grain)",
      pointerEvents: "none",
      mixBlendMode: "multiply"
    }
  }));
}
Object.assign(__ds_scope, { FigurePortrait });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/figures/FigurePortrait.jsx", error: String((e && e.message) || e) }); }

// components/figures/FigureCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FigureCard — a single figure in the roster. Portrait, name (display serif), one-line
 * description, category tag, and availability. "Coming soon" figures render dimmed and
 * non-interactive. A hairline accent edge carries the figure's personal color.
 */
function FigureCard({
  name,
  description,
  category = "historical",
  meta,
  accentColor,
  src,
  status = "published",
  onClick,
  style,
  ...rest
}) {
  const comingSoon = status === "coming-soon";
  const edge = accentColor || (category === "creator" ? "var(--ink-3)" : "var(--indigo-500)");
  return /*#__PURE__*/React.createElement("article", _extends({
    onClick: comingSoon ? undefined : onClick,
    className: "sym-figurecard",
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      padding: "var(--space-5)",
      paddingLeft: "calc(var(--space-5) + 3px)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-line)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sm)",
      cursor: comingSoon ? "default" : "pointer",
      opacity: comingSoon ? 0.6 : 1,
      transition: "transform var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out)",
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: edge
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.FigurePortrait, {
    name: name,
    src: src,
    category: category,
    accentColor: accentColor,
    size: 72
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow"
  }, category === "creator" ? "Creator" : "Historical"), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: comingSoon ? "pending" : "live",
    dot: true
  }, comingSoon ? "Coming soon" : "Published")), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--text-2xl)/1.05 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, name))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--text-md)/1.5 var(--font-serif)",
      color: "var(--text-body)",
      textWrap: "pretty"
    }
  }, description), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    kind: category === "creator" ? "channel" : "era",
    accentColor: accentColor
  }, meta)));
}
Object.assign(__ds_scope, { FigureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/figures/FigureCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/symposium-app/App.jsx
try { (() => {
function App() {
  const [view, setView] = React.useState("roster"); // roster | chat
  const [figure, setFigure] = React.useState(null);
  const [activeSession, setActiveSession] = React.useState(null);
  function openFigure(f) {
    if (f.status === "coming-soon") return;
    setFigure(f);
    setActiveSession(null);
    setView("chat");
  }
  function openSession(id) {
    const s = window.SYM_DATA.sessions.find(x => x.id === id);
    if (!s) return;
    const f = window.SYM_DATA.figures.find(x => x.id === s.figureId);
    setFigure(f);
    setActiveSession(id);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      overflow: "hidden"
    }
  }, view === "roster" ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(RosterScreen, {
    onOpenFigure: openFigure
  })) : /*#__PURE__*/React.createElement(ChatScreen, {
    figure: figure,
    onBack: () => setView("roster"),
    activeSession: activeSession,
    onSelectSession: openSession,
    onNewConversation: () => setView("roster")
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/symposium-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/symposium-app/ChatScreen.jsx
try { (() => {
const {
  SessionSidebar,
  MessageBubble,
  TypingIndicator,
  Composer,
  SuggestedQuestion,
  DisclosureBanner,
  FigurePortrait,
  IconButton,
  Button,
  Badge
} = window.SymposiumDesignSystem_32eaa4;
function ChatHeader({
  figure,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4) var(--space-6)",
      borderBottom: "1px solid var(--border-line)",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Back to roster",
    variant: "ghost",
    onClick: onBack
  }, "\u2190"), /*#__PURE__*/React.createElement(FigurePortrait, {
    name: figure.name,
    category: figure.category,
    accentColor: figure.accentColor,
    shape: "round",
    size: 38,
    grain: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-xl)/1 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, figure.name), /*#__PURE__*/React.createElement(DisclosureBanner, {
    figureName: figure.name,
    inline: true
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)",
      color: "var(--text-faint)"
    }
  }, figure.meta)), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Sources"));
}
function EmptyState({
  figure,
  onAsk
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-chat)",
      margin: "0 auto",
      padding: "var(--space-10) var(--space-6)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(FigurePortrait, {
    name: figure.name,
    category: figure.category,
    accentColor: figure.accentColor,
    size: 92,
    style: {
      margin: "0 auto"
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "var(--space-5) 0 0",
      font: "var(--fw-regular) var(--text-3xl)/1.1 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, figure.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px auto 0",
      maxWidth: "46ch",
      font: "var(--fw-regular) var(--text-md)/1.6 var(--font-serif)",
      color: "var(--text-muted)",
      textWrap: "pretty"
    }
  }, figure.description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "var(--space-8) 0 var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border-hair)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow"
  }, "Begin with"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border-hair)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      textAlign: "left"
    }
  }, figure.openers.map((q, i) => /*#__PURE__*/React.createElement(SuggestedQuestion, {
    key: i,
    accentColor: figure.accentColor,
    onClick: () => onAsk(q)
  }, q))));
}
function ErrorState({
  accentColor,
  onRetry
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 440,
      margin: "0 auto",
      padding: "var(--space-9) var(--space-6)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      margin: "0 auto",
      borderRadius: "50%",
      border: "1.5px solid var(--danger)",
      color: "var(--danger)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "var(--fw-regular) 22px/1 var(--font-display)"
    }
  }, "!"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "var(--space-4) 0 0",
      font: "var(--fw-regular) var(--text-2xl)/1.15 var(--font-display)",
      color: "var(--text-strong)"
    }
  }, "The line went quiet."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px auto 0",
      maxWidth: "38ch",
      font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)",
      color: "var(--text-muted)",
      textWrap: "pretty"
    }
  }, "We couldn't reach the archive to compose a reply. Your message is safe \u2014 try again in a moment."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onRetry
  }, "Try again")));
}
function ChatScreen({
  figure,
  onBack,
  onSelectSession,
  activeSession,
  onNewConversation
}) {
  const [messages, setMessages] = React.useState([]);
  const [draft, setDraft] = React.useState("");
  const [phase, setPhase] = React.useState("idle"); // idle | thinking | streaming | error
  const [streamText, setStreamText] = React.useState("");
  const threadRef = React.useRef(null);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, phase, streamText]);
  const reply = window.SYM_DATA.replies[figure.id] || window.SYM_DATA.replies.marcus;
  function send(text, {
    fail = false
  } = {}) {
    if (!text.trim()) return;
    setDraft("");
    setMessages(m => [...m, {
      role: "user",
      text
    }]);
    setPhase("thinking");
    timers.current.push(setTimeout(() => {
      if (fail) {
        setPhase("error");
        return;
      }
      setPhase("streaming");
      const full = reply.text;
      let i = 0;
      const step = () => {
        i += Math.max(2, Math.round(full.length / 60));
        setStreamText(full.slice(0, i));
        if (i < full.length) timers.current.push(setTimeout(step, 30));else {
          setStreamText("");
          setMessages(m => [...m, {
            role: "assistant",
            text: full,
            citations: reply.citations
          }]);
          setPhase("idle");
        }
      };
      step();
    }, 1400));
  }
  const empty = messages.length === 0 && phase === "idle";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement(SessionSidebar, {
    sessions: window.SYM_DATA.sessions,
    activeId: activeSession,
    onSelect: onSelectSession,
    onNew: onNewConversation
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(ChatHeader, {
    figure: figure,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(DisclosureBanner, {
    figureName: figure.name
  }), /*#__PURE__*/React.createElement("div", {
    ref: threadRef,
    style: {
      flex: 1,
      overflowY: "auto",
      backgroundImage: "var(--texture-grain)"
    }
  }, empty ? /*#__PURE__*/React.createElement(EmptyState, {
    figure: figure,
    onAsk: q => send(q)
  }) : phase === "error" ? /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-chat)",
      margin: "0 auto",
      padding: "var(--space-6)"
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Msg, {
    key: i,
    m: m,
    figure: figure
  })), /*#__PURE__*/React.createElement(ErrorState, {
    accentColor: figure.accentColor,
    onRetry: () => {
      setPhase("idle");
      const last = [...messages].reverse().find(x => x.role === "user");
      if (last) send(last.text);
    }
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-chat)",
      margin: "0 auto",
      padding: "var(--space-7) var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-7)"
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Msg, {
    key: i,
    m: m,
    figure: figure
  })), phase === "thinking" && /*#__PURE__*/React.createElement(TypingIndicator, {
    author: figure.name,
    accentColor: figure.accentColor,
    label: figure.category === "creator" ? "is scanning the transcripts" : "is consulting the text"
  }), phase === "streaming" && /*#__PURE__*/React.createElement(MessageBubble, {
    role: "assistant",
    author: figure.name,
    accentColor: figure.accentColor,
    streaming: true
  }, streamText))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-line)",
      background: "var(--surface-page)",
      padding: "var(--space-4) var(--space-6) var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-chat)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Composer, {
    value: draft,
    onChange: setDraft,
    onSend: t => send(t),
    figureName: figure.name,
    busy: phase === "thinking" || phase === "streaming"
  })))));
}
function Msg({
  m,
  figure
}) {
  if (m.role === "user") return /*#__PURE__*/React.createElement(MessageBubble, {
    role: "user"
  }, m.text);
  return /*#__PURE__*/React.createElement(MessageBubble, {
    role: "assistant",
    author: figure.name,
    accentColor: figure.accentColor,
    citations: m.citations
  }, m.text);
}
Object.assign(window, {
  ChatScreen,
  ChatHeader,
  EmptyState,
  ErrorState
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/symposium-app/ChatScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/symposium-app/RosterScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  FigureCard,
  CategoryTabs,
  Button,
  Badge
} = window.SymposiumDesignSystem_32eaa4;
function Masthead() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: "1px solid var(--border-line)",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-page)",
      margin: "0 auto",
      padding: "0 var(--space-8)",
      height: 68,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) 26px/1 var(--font-display)",
      letterSpacing: "0.02em",
      color: "var(--text-strong)"
    }
  }, "Symposium"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--accent)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow",
    style: {
      fontSize: 11
    }
  }, "The reading room")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "quiet",
    size: "sm"
  }, "About"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Sign in"))));
}
function RosterScreen({
  onOpenFigure
}) {
  const [cat, setCat] = React.useState("historical");
  const figures = window.SYM_DATA.figures;
  const counts = {
    historical: figures.filter(f => f.category === "historical").length,
    creator: figures.filter(f => f.category === "creator").length
  };
  const shown = figures.filter(f => f.category === cat);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      background: "var(--surface-page)",
      backgroundImage: "var(--texture-grain)"
    }
  }, /*#__PURE__*/React.createElement(Masthead, null), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--width-page)",
      margin: "0 auto",
      padding: "var(--space-10) var(--space-8) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 780,
      marginBottom: "var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sym-eyebrow"
  }, "A room of remarkable people"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "14px 0 0",
      font: "var(--fw-regular) var(--text-5xl)/1.02 var(--font-display)",
      color: "var(--text-strong)",
      textWrap: "balance"
    }
  }, "Sit with the minds that shaped us \u2014", /*#__PURE__*/React.createElement("br", null), "and the ones shaping us now."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "20px 0 0",
      maxWidth: "58ch",
      font: "var(--fw-regular) var(--text-lg)/1.6 var(--font-serif)",
      color: "var(--text-muted)",
      textWrap: "pretty"
    }
  }, "Every figure is an AI recreation, grounded in their own words. Ask, and each reply cites its source \u2014 a passage from the page, or the exact moment in a video.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: "var(--space-7)",
      flexWrap: "wrap",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement(CategoryTabs, {
    value: cat,
    onChange: setCat,
    counts: counts
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--text-sm)/1 var(--font-mono)",
      color: "var(--text-faint)"
    }
  }, shown.filter(f => f.status === "published").length, " available \xB7 ", shown.filter(f => f.status === "coming-soon").length, " coming soon")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "var(--space-5)"
    }
  }, shown.map(f => /*#__PURE__*/React.createElement(FigureCard, _extends({
    key: f.id
  }, f, {
    onClick: () => onOpenFigure(f)
  }))))));
}
Object.assign(window, {
  RosterScreen,
  Masthead
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/symposium-app/RosterScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/symposium-app/data.js
try { (() => {
// Shared demo content for the Symposium UI kit.
window.SYM_DATA = {
  figures: [{
    id: "marcus",
    name: "Marcus Aurelius",
    category: "historical",
    accentColor: "#40507A",
    meta: "Stoic · 121–180 AD",
    status: "published",
    description: "Roman emperor and Stoic. Speaks from the Meditations — on duty, mortality, and the discipline of the mind.",
    openers: ["How should I respond when I cannot control what happens to me?", "What does a good life require of me each morning?", "How do you make peace with death?"]
  }, {
    id: "einstein",
    name: "Albert Einstein",
    category: "historical",
    accentColor: "#3B6E7A",
    meta: "Physicist · 1879–1955",
    status: "published",
    description: "Built from letters, essays, and lectures. On curiosity, relativity, and the moral duty of the scientist.",
    openers: ["Why do you say imagination matters more than knowledge?", "What did discovering relativity actually feel like?", "Should scientists concern themselves with politics?"]
  }, {
    id: "churchill",
    name: "Winston Churchill",
    category: "historical",
    accentColor: "#7A5230",
    meta: "Statesman · 1874–1965",
    status: "published",
    description: "Drawn from speeches, histories, and wartime correspondence. On resolve, rhetoric, and dark hours.",
    openers: ["How do you find courage when everything looks lost?", "What makes a speech move a nation?", "Was there a moment you nearly gave up?"]
  }, {
    id: "seneca",
    name: "Seneca",
    category: "historical",
    accentColor: "#5B6E43",
    meta: "Stoic · 4 BC–65 AD",
    status: "coming-soon",
    description: "Statesman, playwright, and Stoic. Letters on time, wealth, and how to live before you die.",
    openers: []
  }, {
    id: "austen",
    name: "Jane Austen",
    category: "historical",
    accentColor: "#8A5A6E",
    meta: "Novelist · 1775–1817",
    status: "coming-soon",
    description: "From the novels and surviving letters — on society, wit, marriage, and the observing eye.",
    openers: []
  }, {
    id: "veritasium",
    name: "Veritasium",
    category: "creator",
    accentColor: "#2A6DF4",
    meta: "Science & Education",
    status: "published",
    description: "Derek Muller's science channel. Built from video transcripts — physics, engineering, and counterintuitive truths.",
    openers: ["Is the universe deterministic?", "Why do misconceptions stick so hard?", "What's the most surprising thing you've filmed?"]
  }, {
    id: "kurzgesagt",
    name: "Kurzgesagt",
    category: "creator",
    accentColor: "#E0563B",
    meta: "Science & Education",
    status: "published",
    description: "In a Nutshell. Big questions, answered in bird-sized pieces — from the channel's narrated scripts.",
    openers: ["Are we alone in the universe?", "Is it too late to stop climate change?", "What would happen if I fell into a black hole?"]
  }, {
    id: "huberman",
    name: "Andrew Huberman",
    category: "creator",
    accentColor: "#1F8A70",
    meta: "Health & Science",
    status: "coming-soon",
    description: "Neuroscience for daily life, from the podcast transcripts — sleep, focus, dopamine, and protocols.",
    openers: []
  }, {
    id: "mkbhd",
    name: "MKBHD",
    category: "creator",
    accentColor: "#C4302B",
    meta: "Technology",
    status: "coming-soon",
    description: "Marques Brownlee on consumer tech. Built from a decade of review transcripts.",
    openers: []
  }],
  sessions: [{
    id: "s1",
    title: "On facing hardship",
    figure: "Marcus Aurelius",
    time: "just now",
    accentColor: "#40507A",
    figureId: "marcus"
  }, {
    id: "s2",
    title: "Is the universe deterministic?",
    figure: "Veritasium",
    time: "2h ago",
    accentColor: "#2A6DF4",
    figureId: "veritasium"
  }, {
    id: "s3",
    title: "Courage in dark hours",
    figure: "Churchill",
    time: "Yesterday",
    accentColor: "#7A5230",
    figureId: "churchill"
  }, {
    id: "s4",
    title: "Imagination vs. knowledge",
    figure: "Einstein",
    time: "Mon",
    accentColor: "#3B6E7A",
    figureId: "einstein"
  }],
  // canned assistant replies keyed by figureId
  replies: {
    marcus: {
      text: "Consider that every obstacle carries within it the material for its own overcoming. You suffer not from the thing itself, but from your judgement of it — and the judgement is yours to revise. Meet the morning by asking only what is within your power; spend nothing on what is not.",
      citations: [{
        variant: "book",
        excerpt: "The impediment to action advances action. What stands in the way becomes the way.",
        source: "Meditations",
        detail: "Book V, 20"
      }, {
        variant: "book",
        excerpt: "You have power over your mind — not outside events. Realize this, and you will find strength.",
        source: "Meditations",
        detail: "Book IV, 3"
      }]
    },
    veritasium: {
      text: "That depends on what you mean by determinism. Classical mechanics is deterministic in principle — give me the exact state and I'll give you the future. But quantum mechanics resists that picture, and even in classical systems, chaos makes prediction practically impossible. The universe may be lawful without being predictable.",
      citations: [{
        variant: "video",
        excerpt: "The universe is not obligated to make sense to you — but it is astonishingly consistent.",
        videoTitle: "Is Reality Real?",
        timestamp: "12:34",
        channelColor: "#2A6DF4",
        href: "#"
      }, {
        variant: "video",
        excerpt: "Chaos means deterministic systems can still be fundamentally unpredictable.",
        videoTitle: "The Butterfly Effect",
        timestamp: "07:52",
        channelColor: "#2A6DF4",
        href: "#"
      }]
    },
    churchill: {
      text: "Courage is rightly esteemed the first of human qualities because it is the quality which guarantees all others. When the hour is darkest, you do not manufacture hope from nothing — you find the next hard thing that must be done, and you do it, and then the one after. Never yield except to convictions of honour and good sense.",
      citations: [{
        variant: "book",
        excerpt: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        source: "Speeches & Writings",
        detail: "Attributed, 1941"
      }]
    },
    einstein: {
      text: "Because knowledge is bounded by what we have already found, while imagination reaches toward everything we have not. I did not arrive at relativity by reasoning in straight lines; I imagined riding alongside a beam of light and asked what I would see. The rigor comes after — but the leap comes first.",
      citations: [{
        variant: "book",
        excerpt: "Imagination is more important than knowledge. Knowledge is limited; imagination encircles the world.",
        source: "On Cosmic Religion",
        detail: "1931"
      }]
    }
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/symposium-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.CitationCard = __ds_scope.CitationCard;

__ds_ns.Composer = __ds_scope.Composer;

__ds_ns.DisclosureBanner = __ds_scope.DisclosureBanner;

__ds_ns.MessageBubble = __ds_scope.MessageBubble;

__ds_ns.SessionSidebar = __ds_scope.SessionSidebar;

__ds_ns.SuggestedQuestion = __ds_scope.SuggestedQuestion;

__ds_ns.TypingIndicator = __ds_scope.TypingIndicator;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.CategoryTabs = __ds_scope.CategoryTabs;

__ds_ns.FigureCard = __ds_scope.FigureCard;

__ds_ns.FigurePortrait = __ds_scope.FigurePortrait;

})();
