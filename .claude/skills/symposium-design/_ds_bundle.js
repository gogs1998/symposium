/* @ds-bundle: {"format":4,"namespace":"SymposiumDesignSystem_7c9615","components":[{"name":"CitationCard","sourcePath":"components/chat/CitationCard.jsx"},{"name":"Composer","sourcePath":"components/chat/Composer.jsx"},{"name":"MessageBubble","sourcePath":"components/chat/MessageBubble.jsx"},{"name":"RegisterIndicator","sourcePath":"components/chat/RegisterIndicator.jsx"},{"name":"SessionSidebar","sourcePath":"components/chat/SessionSidebar.jsx"},{"name":"TypingIndicator","sourcePath":"components/chat/TypingIndicator.jsx"},{"name":"CategoryTabs","sourcePath":"components/roster/CategoryTabs.jsx"},{"name":"FigureCard","sourcePath":"components/roster/FigureCard.jsx"},{"name":"SuggestedQuestion","sourcePath":"components/roster/SuggestedQuestion.jsx"},{"name":"DisclosureBanner","sourcePath":"components/trust/DisclosureBanner.jsx"},{"name":"SourcesPanel","sourcePath":"components/trust/SourcesPanel.jsx"}],"sourceHashes":{"components/chat/CitationCard.jsx":"5317f2f88a3b","components/chat/Composer.jsx":"c5ea8cde984e","components/chat/MessageBubble.jsx":"89dd7ef45736","components/chat/RegisterIndicator.jsx":"4ebd3767acd2","components/chat/SessionSidebar.jsx":"d9a205487ca8","components/chat/TypingIndicator.jsx":"a9e17dc4d3bd","components/roster/CategoryTabs.jsx":"f6e2e40bfb27","components/roster/FigureCard.jsx":"bbf0d94e78eb","components/roster/SuggestedQuestion.jsx":"b2fa22a7bca4","components/trust/DisclosureBanner.jsx":"9f44643ed003","components/trust/SourcesPanel.jsx":"24efa7f267ac","ui_kits/app/ChatScreen.jsx":"76a875d9aff8","ui_kits/app/FigureIntroScreen.jsx":"4572a4256c5c","ui_kits/app/RosterScreen.jsx":"d67032c6965d","ui_kits/app/data.js":"b8b7148c65d8","ui_kits/landing/Landing.jsx":"80c47733566e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SymposiumDesignSystem_7c9615 = window.SymposiumDesignSystem_7c9615 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chat/CitationCard.jsx
try { (() => {
/** A source citation. Book variant shows title + locator; video variant adds thumbnail + timestamp deep-link. */
function CitationCard({
  type = 'book',
  title,
  locator,
  excerpt,
  timestamp,
  date,
  thumbnail,
  href,
  onClick
}) {
  const isVideo = type === 'video';
  const accent = isVideo ? 'var(--bronze)' : 'var(--bronze-deep)';
  return /*#__PURE__*/React.createElement("a", {
    href: href || '#',
    onClick: e => {
      if (!href) e.preventDefault();
      onClick && onClick();
    },
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      textDecoration: 'none',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)',
      background: 'var(--bronze-tint)',
      padding: '10px 12px',
      color: 'var(--text-body)',
      transition: 'border-color var(--dur-fast) var(--ease-out)',
      borderBottom: '1px solid var(--stone-line)'
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = 'var(--bronze)',
    onMouseLeave: e => e.currentTarget.style.borderColor = 'var(--stone-line)'
  }, isVideo && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 40,
      flexShrink: 0,
      borderRadius: 'var(--radius-1)',
      background: 'var(--ink-1)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, thumbnail && /*#__PURE__*/React.createElement("img", {
    src: thumbnail,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(.6)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-inverse)',
      fontSize: 10
    }
  }, "\u25B6")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: accent
    }
  }, isVideo ? 'Video source' : 'Book source', timestamp && /*#__PURE__*/React.createElement("span", null, " \xB7 ", timestamp), date && /*#__PURE__*/React.createElement("span", null, " \xB7 ", date)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic'
    }
  }, title), locator && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, " \xB7 ", locator)), excerpt && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      marginTop: 4,
      lineHeight: 1.5,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, "\u201C", excerpt, "\u201D")));
}
Object.assign(__ds_scope, { CitationCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/CitationCard.jsx", error: String((e && e.message) || e) }); }

// components/chat/Composer.jsx
try { (() => {
const {
  useState
} = React;
/** The chat input bar: text field + send, fixed at the bottom of a chat column. */
function Composer({
  placeholder = 'Ask anything…',
  disabled = false,
  onSend
}) {
  const [value, setValue] = useState('');
  const submit = e => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend && onSend(value);
    setValue('');
  };
  return /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => setValue(e.target.value),
    placeholder: placeholder,
    disabled: disabled,
    style: {
      flex: 1,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-body)',
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line-strong)',
      borderRadius: 'var(--radius-1)',
      padding: '12px 16px',
      outline: 'none'
    },
    onFocus: e => e.target.style.borderColor = 'var(--accent)',
    onBlur: e => e.target.style.borderColor = 'var(--stone-line-strong)'
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: disabled || !value.trim(),
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      letterSpacing: '0.06em',
      background: value.trim() && !disabled ? 'var(--ink-1)' : 'var(--surface-inset)',
      color: value.trim() && !disabled ? 'var(--ink-inverse)' : 'var(--text-muted)',
      border: 'none',
      borderRadius: 'var(--radius-1)',
      padding: '0 22px',
      cursor: value.trim() && !disabled ? 'pointer' : 'default',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, "SEND"));
}
Object.assign(__ds_scope, { Composer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/Composer.jsx", error: String((e && e.message) || e) }); }

// components/chat/MessageBubble.jsx
try { (() => {
/** A chat message. Figure replies read like a manuscript page; user messages are ink plaques. */
function MessageBubble({
  role = 'assistant',
  author,
  register,
  children,
  citations
}) {
  if (role === 'user') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '72%',
        background: 'var(--ink-1)',
        color: 'var(--ink-inverse)',
        borderRadius: 'var(--radius-2)',
        padding: '12px 16px',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        lineHeight: 1.55
      }
    }, children));
  }
  if (role === 'system') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: '4px 0'
      }
    }, children);
  }
  const regColor = register === 'on-camera' ? 'var(--register-oncamera)' : register === 'written' ? 'var(--register-written)' : 'var(--register-conversational)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '82%',
      fontFamily: 'var(--font-body)'
    }
  }, (author || register) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginBottom: 6
    }
  }, author && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      letterSpacing: '0.03em'
    }
  }, author), register && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: regColor
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: regColor,
      display: 'inline-block'
    }
  }), register, " voice")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-2)',
      boxShadow: 'var(--shadow-1)',
      padding: '14px 18px',
      fontSize: 'var(--text-base)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-body)',
      whiteSpace: 'pre-wrap'
    }
  }, children, citations && citations.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: 'var(--rule-double)',
      marginTop: 14,
      paddingTop: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, citations))));
}
Object.assign(__ds_scope, { MessageBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/MessageBubble.jsx", error: String((e && e.message) || e) }); }

// components/chat/RegisterIndicator.jsx
try { (() => {
const {
  useState
} = React;
/** Pill chip showing which voice the persona is drawing from, with a nudge menu to steer it. */
function RegisterIndicator({
  registers = ['on-camera', 'conversational', 'written'],
  active = 'conversational',
  onNudge
}) {
  const [open, setOpen] = useState(false);
  const meta = {
    'on-camera': {
      color: 'var(--register-oncamera)',
      tint: 'var(--register-oncamera-tint)',
      deep: 'var(--bronze-deep)',
      hint: 'Scripted, performed — intros, monologues'
    },
    'conversational': {
      color: 'var(--register-conversational)',
      tint: 'var(--register-conversational-tint)',
      deep: 'var(--lapis-deep)',
      hint: 'Long-form talk — podcasts, interviews'
    },
    'written': {
      color: 'var(--register-written)',
      tint: 'var(--register-written-tint)',
      deep: 'var(--verdigris)',
      hint: 'Books, posts, letters'
    }
  };
  const m = meta[active] || meta['conversational'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'inline-block',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    title: "Change which voice replies draw from",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: m.tint,
      border: `1px solid ${m.color}`,
      borderRadius: 999,
      padding: '5px 12px',
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 999,
      background: m.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: m.deep
    }
  }, active, " voice"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: m.deep,
      fontSize: 9
    }
  }, "\u25BE")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      right: 0,
      zIndex: 30,
      width: 300,
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line-strong)',
      borderRadius: 'var(--radius-2)',
      boxShadow: 'var(--shadow-overlay)',
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: '6px 10px'
    }
  }, "Draw replies from"), registers.map(r => {
    const rm = meta[r];
    return /*#__PURE__*/React.createElement("button", {
      key: r,
      onClick: () => {
        setOpen(false);
        onNudge && onNudge(r);
      },
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: r === active ? rm.tint : 'none',
        border: 'none',
        borderRadius: 'var(--radius-1)',
        padding: '8px 10px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)'
      },
      onMouseEnter: e => {
        if (r !== active) e.currentTarget.style.background = 'var(--surface-raised)';
      },
      onMouseLeave: e => {
        if (r !== active) e.currentTarget.style.background = 'none';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: rm.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        color: rm.deep
      }
    }, r)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        marginTop: 2
      }
    }, rm.hint));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--stone-line)',
      marginTop: 6,
      padding: '8px 10px',
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      color: 'var(--text-muted)'
    }
  }, "Or just ask: \u201Ctalk to me like the podcast, not the show intro.\u201D")));
}
Object.assign(__ds_scope, { RegisterIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/RegisterIndicator.jsx", error: String((e && e.message) || e) }); }

// components/chat/SessionSidebar.jsx
try { (() => {
/** Left rail listing past sessions grouped by figure. */
function SessionSidebar({
  sessions = [],
  activeId,
  onSelect,
  onNew
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      background: 'var(--surface-raised)',
      borderRight: '1px solid var(--stone-line)',
      padding: 'var(--space-4)',
      boxSizing: 'border-box',
      height: '100%',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onNew,
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.06em',
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line-strong)',
      borderRadius: 'var(--radius-1)',
      padding: '10px 12px',
      cursor: 'pointer',
      color: 'var(--text-body)',
      marginBottom: 12
    }
  }, "+ NEW CONVERSATION"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: '0 4px 6px'
    }
  }, "Sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      overflowY: 'auto'
    }
  }, sessions.map(s => {
    const isActive = s.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: () => onSelect && onSelect(s.id),
      style: {
        textAlign: 'left',
        background: isActive ? 'var(--accent-surface)' : 'none',
        border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
        borderRadius: 'var(--radius-1)',
        padding: '8px 10px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)'
      },
      onMouseEnter: e => {
        if (!isActive) e.currentTarget.style.background = 'var(--marble-2)';
      },
      onMouseLeave: e => {
        if (!isActive) e.currentTarget.style.background = 'none';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-body)'
      }
    }, s.figure), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, s.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        marginTop: 2
      }
    }, s.when));
  })));
}
Object.assign(__ds_scope, { SessionSidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/SessionSidebar.jsx", error: String((e && e.message) || e) }); }

// components/chat/TypingIndicator.jsx
try { (() => {
/** Three dots stepping opacity — no bounce. Shown while a figure retrieves and writes. */
function TypingIndicator({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes sym-dot{0%,60%,100%{opacity:.25}30%{opacity:1}}`), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 5
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: 'var(--ink-3)',
      animation: `sym-dot 1.3s ${i * 0.18}s infinite`
    }
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { TypingIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/TypingIndicator.jsx", error: String((e && e.message) || e) }); }

// components/roster/CategoryTabs.jsx
try { (() => {
/** Underlined tab row for roster categories. */
function CategoryTabs({
  tabs,
  active,
  onChange,
  counts = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      borderBottom: '1px solid var(--stone-line)'
    }
  }, tabs.map(t => {
    const isActive = t === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => onChange && onChange(t),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 2px 12px',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-md)',
        letterSpacing: '0.04em',
        color: isActive ? 'var(--text-body)' : 'var(--text-muted)',
        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        marginBottom: -1,
        transition: 'color var(--dur-fast) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
      },
      onMouseLeave: e => {
        if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
      }
    }, t, counts[t] != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        marginLeft: 8
      }
    }, counts[t]));
  }));
}
Object.assign(__ds_scope, { CategoryTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/roster/CategoryTabs.jsx", error: String((e && e.message) || e) }); }

// components/roster/FigureCard.jsx
try { (() => {
/** A roster plaque for one figure or creator. */
function FigureCard({
  name,
  era,
  description,
  categories = [],
  fields = [],
  available = true,
  selected = false,
  kind = 'historical',
  portrait,
  onClick
}) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return /*#__PURE__*/React.createElement("button", {
    onClick: available ? onClick : undefined,
    disabled: !available,
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      cursor: available ? 'pointer' : 'default',
      background: selected ? 'var(--accent-surface)' : 'var(--surface-card)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--stone-line)'}`,
      borderRadius: 'var(--radius-2)',
      boxShadow: 'var(--shadow-1)',
      padding: 'var(--space-5)',
      opacity: available ? 1 : 0.55,
      fontFamily: 'var(--font-body)',
      color: 'var(--text-body)',
      transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)'
    },
    onMouseEnter: e => {
      if (available && !selected) e.currentTarget.style.borderColor = 'var(--stone-line-strong)';
    },
    onMouseLeave: e => {
      if (!selected) e.currentTarget.style.borderColor = 'var(--stone-line)';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: '999px',
      flexShrink: 0,
      overflow: 'hidden',
      background: 'var(--surface-inset)',
      border: '1px solid var(--stone-line-strong)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, portrait ? /*#__PURE__*/React.createElement("img", {
    src: portrait,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(1) contrast(1.05)'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      color: 'var(--text-secondary)'
    }
  }, initials)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: kind === 'creator' ? 'var(--bronze-deep)' : 'var(--text-muted)'
    }
  }, categories[0] || (kind === 'creator' ? 'Creator' : 'Historical'), " \xB7 ", era), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      lineHeight: 1.2,
      marginTop: 4
    }
  }, name))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: 'var(--rule-double)',
      margin: '12px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 1.55
    }
  }, description), fields.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 12
    }
  }, fields.map(f => /*#__PURE__*/React.createElement("span", {
    key: f,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)',
      padding: '2px 8px'
    }
  }, f))), !available && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginTop: 12
    }
  }, "No sources ingested yet"));
}
Object.assign(__ds_scope, { FigureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/roster/FigureCard.jsx", error: String((e && e.message) || e) }); }

// components/roster/SuggestedQuestion.jsx
try { (() => {
/** A tappable opener suggestion shown in empty chats and figure intros. */
function SuggestedQuestion({
  text,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)',
      padding: '10px 14px',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
      lineHeight: 1.5,
      transition: 'all var(--dur-fast) var(--ease-out)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.borderColor = 'var(--stone-line-strong)';
      e.currentTarget.style.background = 'var(--surface-raised)';
      e.currentTarget.style.color = 'var(--text-body)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = 'var(--stone-line)';
      e.currentTarget.style.background = 'var(--surface-card)';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'normal',
      color: 'var(--bronze)',
      marginRight: 8
    }
  }, "\u2014"), text);
}
Object.assign(__ds_scope, { SuggestedQuestion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/roster/SuggestedQuestion.jsx", error: String((e && e.message) || e) }); }

// components/trust/DisclosureBanner.jsx
try { (() => {
/** The honesty line. Persistent, quiet, never dismissible-looking. */
function DisclosureBanner({
  figureName,
  basis = 'published writings',
  compact = false
}) {
  const text = figureName ? /*#__PURE__*/React.createElement(React.Fragment, null, "This is an AI recreation built from ", figureName, "\u2019s ", basis, ". It is not ", figureName, ".") : /*#__PURE__*/React.createElement(React.Fragment, null, "Every persona here is an AI recreation, grounded in and citing its subject\u2019s own words.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--surface-raised)',
      borderTop: '1px solid var(--stone-line)',
      borderBottom: '1px solid var(--stone-line)',
      padding: compact ? '6px 14px' : '10px 16px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      color: 'var(--text-secondary)',
      justifyContent: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'normal',
      color: 'var(--bronze)',
      fontSize: 'var(--text-sm)'
    }
  }, "\xA7"), /*#__PURE__*/React.createElement("span", null, text));
}
Object.assign(__ds_scope, { DisclosureBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/DisclosureBanner.jsx", error: String((e && e.message) || e) }); }

// components/trust/SourcesPanel.jsx
try { (() => {
/** The trust surface: a slide-in panel cataloguing the figure's corpus, what "grounded" means, and the ethics note. */
function SourcesPanel({
  figureName,
  basis = 'published writings',
  totals,
  books = [],
  videos = [],
  collections = [],
  onClose
}) {
  const Label = ({
    children,
    color = 'var(--text-muted)'
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color
    }
  }, children);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 420,
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-card)',
      borderLeft: '1px solid var(--stone-line-strong)',
      boxShadow: 'var(--shadow-overlay)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 16px',
      borderBottom: 'var(--rule-double)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, null, "The corpus"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      lineHeight: 1.15,
      marginTop: 4
    }
  }, figureName), totals && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      marginTop: 6
    }
  }, totals)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)',
      width: 28,
      height: 28,
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      fontSize: 14,
      lineHeight: 1
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6
    }
  }, "Everything this recreation says is retrieved from the corpus below, and every reply cites the passage it drew on. Nothing is invented beyond it."), books.length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(Label, {
    color: "var(--bronze-deep)"
  }, "Books & writings \xB7 ", books.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: 8
    }
  }, books.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      alignItems: 'baseline',
      padding: '9px 0',
      borderBottom: '1px solid var(--stone-line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic'
    }
  }, b.title, /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'normal',
      color: 'var(--text-muted)'
    }
  }, b.year ? ` (${b.year})` : '')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, b.size))))), videos.length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(Label, {
    color: "var(--bronze-deep)"
  }, "Video & audio \xB7 ", videos.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8
    }
  }, videos.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 44,
      flexShrink: 0,
      borderRadius: 'var(--radius-1)',
      background: 'var(--ink-1)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, v.thumbnail && /*#__PURE__*/React.createElement("img", {
    src: v.thumbnail,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(.6)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-inverse)',
      fontSize: 10
    }
  }, "\u25B6")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, v.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, v.duration, v.date ? ` · ${v.date}` : '')))))), collections.length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(Label, {
    color: "var(--bronze-deep)"
  }, "Post collections \xB7 ", collections.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: 8
    }
  }, collections.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      alignItems: 'baseline',
      padding: '9px 0',
      borderBottom: '1px solid var(--stone-line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)'
    }
  }, c.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, c.size))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-2)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Label, null, "What \u201Cgrounded\u201D means"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      marginTop: 6
    }
  }, "Before every reply, the most relevant passages are retrieved from this corpus. The persona writes from those passages \u2014 in ", figureName ? `${figureName}’s` : 'the subject’s', " documented voice \u2014 and shows you which ones it used.")), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: 'var(--rule-double)',
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(Label, null, "On recreating a person"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      marginTop: 6
    }
  }, "This is an interpretation built from ", basis, " \u2014 not the person, and not their estate\u2019s voice. Where the corpus is silent, the recreation says so rather than guessing."))));
}
Object.assign(__ds_scope, { SourcesPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/SourcesPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ChatScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ChatScreen({
  figure,
  initialQuestion,
  onBack
}) {
  const {
    MessageBubble: CB,
    CitationCard: CC,
    Composer: CComposer,
    TypingIndicator: CTyping,
    RegisterIndicator: CReg,
    DisclosureBanner: CDisc,
    SourcesPanel: CSources,
    SuggestedQuestion: CSuggested
  } = window.SymposiumDesignSystem_7c9615;
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [register, setRegister] = React.useState((figure.registers || [])[1] || (figure.registers || [])[0] || 'written');
  const [showSources, setShowSources] = React.useState(false);
  const scrollRef = React.useRef(null);
  const isCreator = (figure.registers || []).length > 1;
  const reply = window.SYM_DATA.replies[figure.id] || window.SYM_DATA.replies.default;
  const send = text => {
    setMessages(m => [...m, {
      role: 'user',
      text
    }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, {
        role: 'assistant',
        text: reply.text,
        register: isCreator ? register : reply.register,
        citations: reply.citations
      }]);
    }, 1400);
  };
  const nudge = r => {
    setRegister(r);
    setMessages(m => [...m, {
      role: 'system',
      text: `Drawing from the ${r} voice`
    }]);
  };
  React.useEffect(() => {
    if (initialQuestion) send(initialQuestion);
  }, []);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px var(--space-6)',
      borderBottom: '1px solid var(--stone-line)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: 0
    }
  }, "\u2190 Roster"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)'
    }
  }, figure.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginLeft: 12
    }
  }, figure.era)), isCreator && /*#__PURE__*/React.createElement(CReg, {
    registers: figure.registers,
    active: register,
    onNudge: nudge
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSources(true),
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.06em',
      background: 'var(--surface-raised)',
      border: '1px solid var(--stone-line-strong)',
      borderRadius: 'var(--radius-1)',
      padding: '8px 14px',
      cursor: 'pointer',
      color: 'var(--text-body)'
    }
  }, "SOURCES")), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: '0 auto',
      padding: 'var(--space-5) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, messages.length === 0 && !typing && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 'var(--space-7) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-secondary)'
    }
  }, "Ask anything."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      color: 'var(--text-muted)',
      marginTop: 6
    }
  }, "Replies draw only on what ", figure.name, " actually ", figure.kind === 'creator' ? 'said and wrote' : 'wrote', "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      marginTop: 'var(--space-5)'
    }
  }, (figure.openers || []).slice(0, 3).map(q => /*#__PURE__*/React.createElement(CSuggested, {
    key: q,
    text: q,
    onClick: () => send(q)
  })))), messages.map((m, i) => m.role === 'system' ? /*#__PURE__*/React.createElement(CB, {
    key: i,
    role: "system"
  }, m.text) : /*#__PURE__*/React.createElement(CB, {
    key: i,
    role: m.role,
    author: m.role === 'assistant' ? figure.name : undefined,
    register: m.role === 'assistant' && isCreator ? m.register : undefined,
    citations: m.citations && m.citations.map((c, j) => /*#__PURE__*/React.createElement(CC, _extends({
      key: j
    }, c)))
  }, m.text)), typing && /*#__PURE__*/React.createElement(CTyping, {
    label: "Consulting the corpus"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement(CDisc, {
    figureName: figure.name,
    basis: figure.basis,
    compact: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: '0 auto',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(CComposer, {
    placeholder: `Ask ${figure.name} anything…`,
    disabled: typing,
    onSend: send
  }))), showSources && /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowSources(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(28,43,58,.32)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(CSources, {
    figureName: figure.name,
    basis: figure.basis,
    totals: figure.totals,
    books: figure.books || [],
    videos: figure.videos || [],
    collections: figure.collections || [],
    onClose: () => setShowSources(false)
  }))));
}
window.ChatScreen = ChatScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ChatScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/FigureIntroScreen.jsx
try { (() => {
function FigureIntroScreen({
  figure,
  onBegin,
  onBack,
  onOpenWith
}) {
  const {
    SuggestedQuestion: IntroSuggested,
    DisclosureBanner: IntroDisclosure
  } = window.SymposiumDesignSystem_7c9615;
  const regMeta = {
    'on-camera': ['var(--register-oncamera)', 'On-camera voice'],
    'conversational': ['var(--register-conversational)', 'Conversational voice'],
    'written': ['var(--register-written)', 'Written voice']
  };
  const initials = figure.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const srcBits = [];
  if (figure.books && figure.books.length) srcBits.push(`${figure.books.length} books`);
  if (figure.videos && figure.videos.length) srcBits.push(`${figure.videos.length} video sources`);
  if (figure.collections && figure.collections.length) srcBits.push(`${figure.collections.length} post collections`);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto',
      padding: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: 0
    }
  }, "\u2190 The roster"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-2)',
      boxShadow: 'var(--shadow-1)',
      marginTop: 'var(--space-4)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      padding: 'var(--space-6)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 128,
      flexShrink: 0,
      borderRadius: 'var(--radius-1)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--stone-line-strong)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 34,
      color: 'var(--text-muted)'
    }
  }, initials)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: figure.kind === 'creator' ? 'var(--bronze-deep)' : 'var(--text-muted)'
    }
  }, figure.categories[0], " \xB7 ", figure.era), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      lineHeight: 'var(--leading-tight)',
      marginTop: 4
    }
  }, figure.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-secondary)',
      marginTop: 8
    }
  }, figure.description))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: 'var(--rule-double)',
      padding: 'var(--space-5) var(--space-6)',
      background: 'var(--surface-raised)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "How this recreation was built"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 10
    }
  }, srcBits.map(b => /*#__PURE__*/React.createElement("span", {
    key: b,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--bronze-deep)',
      background: 'var(--bronze-tint)',
      border: '1px solid var(--stone-line)',
      borderRadius: 'var(--radius-1)',
      padding: '3px 9px'
    }
  }, b)), (figure.registers || []).map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
      border: '1px solid var(--stone-line)',
      borderRadius: 999,
      padding: '3px 10px',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: regMeta[r][0]
    }
  }), regMeta[r][1]))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      marginTop: 10,
      maxWidth: '58ch'
    }
  }, figure.builtNote)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 10
    }
  }, "Openers"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, (figure.openers || []).map(q => /*#__PURE__*/React.createElement(IntroSuggested, {
    key: q,
    text: q,
    onClick: () => onOpenWith(q)
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onBegin,
    style: {
      marginTop: 'var(--space-5)',
      width: '100%',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-md)',
      letterSpacing: '0.08em',
      background: 'var(--ink-1)',
      color: 'var(--ink-inverse)',
      border: 'none',
      borderRadius: 'var(--radius-1)',
      padding: '14px 0',
      cursor: 'pointer'
    }
  }, "BEGIN THE CONVERSATION"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(IntroDisclosure, {
    figureName: figure.name,
    basis: figure.basis,
    compact: true
  })));
}
window.FigureIntroScreen = FigureIntroScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/FigureIntroScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/RosterScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function RosterScreen({
  figures,
  onOpen
}) {
  const {
    FigureCard,
    CategoryTabs
  } = window.SymposiumDesignSystem_7c9615;
  const [tab, setTab] = React.useState('Historical');
  const shown = figures.filter(f => tab === 'Creators' ? f.kind === 'creator' : f.kind === 'historical');
  const counts = {
    Historical: figures.filter(f => f.kind === 'historical').length,
    Creators: figures.filter(f => f.kind === 'creator').length
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '0 var(--space-6) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: 'var(--space-7) 0 var(--space-5)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      letterSpacing: '0.06em'
    }
  }, "SYMPOSIUM"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      color: 'var(--text-secondary)',
      marginTop: 6
    }
  }, "Conversations grounded in their own words \u2014 every reply cites its source.")), /*#__PURE__*/React.createElement(CategoryTabs, {
    tabs: ['Historical', 'Creators'],
    active: tab,
    onChange: setTab,
    counts: counts
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-5)',
      alignItems: 'start'
    }
  }, shown.map(f => /*#__PURE__*/React.createElement(FigureCard, _extends({
    key: f.id
  }, f, {
    onClick: () => onOpen(f)
  })))));
}
window.RosterScreen = RosterScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/RosterScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.SYM_DATA = {
  figures: [{
    id: 'einstein',
    name: 'Albert Einstein',
    era: '1879–1955',
    kind: 'historical',
    categories: ['Scientists'],
    fields: ['Physics', 'Philosophy of Science'],
    description: 'Theoretical physicist who developed the theory of relativity.',
    available: true,
    basis: 'published papers, letters and lectures',
    totals: '9 works · 1,860 pages',
    books: [{
      title: 'Relativity: The Special and General Theory',
      year: '1916',
      size: '168 pages'
    }, {
      title: 'The World As I See It',
      year: '1934',
      size: '112 pages'
    }, {
      title: 'Autobiographical Notes',
      year: '1949',
      size: '96 pages'
    }],
    collections: [{
      title: 'Letters to Born & Bohr',
      size: '214 letters'
    }],
    registers: ['written'],
    openers: ['What would you see riding alongside a beam of light?', 'Why did quantum mechanics trouble you?', 'How did the patent office shape your thinking?'],
    builtNote: 'Retrieval over his published physics writing and personal correspondence; replies favor the plain, analogy-rich register of his popular essays.'
  }, {
    id: 'darwin',
    name: 'Charles Darwin',
    era: '1809–1882',
    kind: 'historical',
    categories: ['Scientists'],
    fields: ['Biology', 'Evolution', 'Geology'],
    description: 'Naturalist and biologist, developed the theory of evolution.',
    available: true,
    basis: 'published books and correspondence',
    totals: '6 works · 2,140 pages',
    books: [{
      title: 'On the Origin of Species',
      year: '1859',
      size: '502 pages'
    }, {
      title: 'The Descent of Man',
      year: '1871',
      size: '688 pages'
    }, {
      title: 'The Voyage of the Beagle',
      year: '1839',
      size: '496 pages'
    }],
    collections: [{
      title: 'Correspondence with Hooker & Lyell',
      size: '312 letters'
    }],
    registers: ['written'],
    openers: ['What convinced you natural selection was real?', 'Tell me about the Galápagos finches.', 'How do you weigh evidence before publishing?'],
    builtNote: 'Retrieval over his books and letters; replies keep his cautious, evidence-first cadence.'
  }, {
    id: 'aurelius',
    name: 'Marcus Aurelius',
    era: '121–180 CE',
    kind: 'historical',
    categories: ['Philosophers'],
    fields: ['Stoicism', 'Ethics', 'Leadership'],
    description: 'Roman Emperor and Stoic philosopher.',
    available: true,
    basis: 'Meditations and letters to Fronto',
    totals: '2 works · 480 pages',
    books: [{
      title: 'Meditations',
      year: 'c. 170',
      size: '304 pages'
    }, {
      title: 'Letters to Fronto',
      year: 'c. 145',
      size: '176 pages'
    }],
    collections: [],
    registers: ['written'],
    openers: ['How do you begin a difficult day?', 'What is within my control?', 'Does power corrupt even a philosopher?'],
    builtNote: 'Retrieval over the Meditations; replies are private-journal in tone — terse, self-addressed, unadorned.'
  }, {
    id: 'plato',
    name: 'Plato',
    era: '428–348 BCE',
    kind: 'historical',
    categories: ['Philosophers'],
    fields: ['Philosophy', 'Ethics', 'Politics'],
    description: 'Athenian philosopher, student of Socrates, founder of the Academy.',
    available: true,
    basis: 'dialogues',
    totals: '12 works · 3,020 pages',
    books: [{
      title: 'The Republic',
      size: '416 pages'
    }, {
      title: 'Symposium',
      size: '128 pages'
    }, {
      title: 'Phaedo',
      size: '144 pages'
    }],
    collections: [],
    registers: ['written'],
    openers: ['Is justice the interest of the stronger?', 'Walk me out of the cave.', 'What did Socrates teach you about questions?'],
    builtNote: 'Retrieval over the dialogues; replies often answer with questions, as the source does.'
  }, {
    id: 'douglass',
    name: 'Frederick Douglass',
    era: '1818–1895',
    kind: 'historical',
    categories: ['Reformers'],
    fields: ['Rhetoric', 'Human Rights'],
    description: 'Abolitionist, orator, writer, and statesman.',
    available: true,
    basis: 'narratives and collected speeches',
    totals: '5 works · 1,480 pages',
    books: [{
      title: 'Narrative of the Life of Frederick Douglass',
      year: '1845',
      size: '160 pages'
    }, {
      title: 'My Bondage and My Freedom',
      year: '1855',
      size: '464 pages'
    }],
    collections: [{
      title: 'Collected speeches 1841–1894',
      size: '188 speeches'
    }],
    registers: ['written'],
    openers: ['What does the Fourth of July mean?', 'How did literacy become your path to freedom?'],
    builtNote: 'Retrieval over his autobiographies and speeches; replies carry his oratorical register.'
  }, {
    id: 'curie',
    name: 'Marie Curie',
    era: '1867–1934',
    kind: 'historical',
    categories: ['Scientists'],
    fields: ['Chemistry', 'Physics'],
    description: 'Pioneer of radioactivity research, twice Nobel laureate.',
    available: false,
    books: [],
    collections: [],
    registers: ['written'],
    openers: [],
    basis: '',
    totals: '',
    builtNote: ''
  }, {
    id: 'rogan',
    name: 'Joe Rogan',
    era: 'Creator',
    kind: 'creator',
    categories: ['Creators'],
    fields: ['Podcasts', 'Long-form interviews'],
    description: 'Podcast host; corpus of thousands of hours of long-form conversation.',
    available: true,
    basis: 'podcast episodes, stand-up specials and posts',
    totals: '214 episodes · 612 h · 48 posts',
    books: [],
    videos: [{
      title: 'JRE #1169 — Elon Musk',
      duration: '2 h 37 m',
      date: 'Sep 2018'
    }, {
      title: 'JRE #1470 — Post-quarantine comedy',
      duration: '3 h 04 m',
      date: 'May 2020'
    }, {
      title: 'Strange Times (special)',
      duration: '1 h 04 m',
      date: 'Oct 2018'
    }],
    collections: [{
      title: 'Instagram & X posts 2015–2026',
      size: '48 collections'
    }],
    registers: ['on-camera', 'conversational', 'written'],
    openers: ['How do you prepare for a long conversation?', 'What changed comedy in the last decade?', 'Talk me through a hard workout.'],
    builtNote: 'Three registers ingested separately: on-camera (show intros, specials), conversational (podcast talk), written (posts). Replies label which voice they draw from, and you can nudge between them.'
  }, {
    id: 'mrbeast',
    name: 'MrBeast',
    era: 'Creator',
    kind: 'creator',
    categories: ['Creators'],
    fields: ['Video', 'Philanthropy'],
    description: 'Video creator; corpus of videos, interviews and posts.',
    available: true,
    basis: 'videos, interviews and posts',
    totals: '312 videos · 96 h · 120 posts',
    books: [],
    videos: [{
      title: 'I Gave Away $1,000,000',
      duration: '14 m',
      date: 'Jan 2022'
    }, {
      title: 'Lex Fridman interview #351',
      duration: '2 h 08 m',
      date: 'Jan 2023'
    }],
    collections: [{
      title: 'X posts 2018–2026',
      size: '120 collections'
    }],
    registers: ['on-camera', 'conversational', 'written'],
    openers: ['How do you decide a video idea is worth it?', 'What does retention actually reward?'],
    builtNote: 'On-camera register is high-energy scripted narration; conversational register comes from interviews — they read very differently, and replies say which is which.'
  }],
  replies: {
    default: {
      text: 'That lies at the edge of what I set down in writing — let me answer from what the corpus does hold.',
      citations: []
    },
    einstein: {
      text: 'Imagine you are in a smoothly running train, and lightning strikes the embankment at two points. Whether the strikes are simultaneous depends on your motion — simultaneity is not absolute but relative to the observer. This was the loose thread; pulling it unraveled absolute time altogether.',
      register: 'written',
      citations: [{
        type: 'book',
        title: 'Relativity: The Special and General Theory',
        locator: 'ch. 9',
        excerpt: 'Events which are simultaneous with reference to the embankment are not simultaneous with respect to the train.'
      }]
    },
    darwin: {
      text: 'It was the accumulation of small facts that persuaded me — the finches of the Galápagos, each island with its own beak; the barnacles I dissected for eight years. Grand theories should be built as coral reefs are: minutely, and under pressure.',
      register: 'written',
      citations: [{
        type: 'book',
        title: 'On the Origin of Species',
        locator: 'ch. 4',
        excerpt: 'Natural selection acts solely by accumulating slight successive favourable variations.'
      }]
    },
    aurelius: {
      text: 'At dawn, say to yourself: today I shall meet the meddling, the ungrateful, the arrogant. None of them can harm me, for none can make me act against my nature. Begin there, and the day is already half won.',
      register: 'written',
      citations: [{
        type: 'book',
        title: 'Meditations',
        locator: 'bk. 2',
        excerpt: 'Say to yourself in the early morning: I shall meet today ungrateful, violent, treacherous men…'
      }]
    },
    plato: {
      text: 'You ask what justice is — but tell me first: when your physician prescribes what is bitter, does he serve your interest or his own? Then is the ruler who prescribes law a physician, or a shepherd fattening his flock? Let us follow the question where it leads.',
      register: 'written',
      citations: [{
        type: 'book',
        title: 'The Republic',
        locator: 'bk. 1',
        excerpt: 'Justice is the excellence of the soul, and injustice the defect of the soul.'
      }]
    },
    douglass: {
      text: 'Once you learn to read, you will be forever free. It was in Baltimore, with bread traded to poor white boys for lessons, that I understood the pathway from slavery to freedom ran through the alphabet.',
      register: 'written',
      citations: [{
        type: 'book',
        title: 'Narrative of the Life of Frederick Douglass',
        locator: 'ch. 7',
        excerpt: 'From that moment, I understood the pathway from slavery to freedom.'
      }]
    },
    rogan: {
      text: "You have to actually be curious, man. That's the whole thing. If I'm not genuinely interested in what someone knows, the conversation is dead before it starts. I read their stuff, I watch their talks, and then I just... talk. No script. Three hours goes by like nothing when it's real.",
      register: 'conversational',
      citations: [{
        type: 'video',
        title: 'JRE #1169',
        timestamp: '01:14:32',
        date: 'Sep 2018',
        excerpt: "You have to be genuinely curious, that's the whole thing."
      }]
    },
    mrbeast: {
      text: "Every idea gets one question: would YOU click it? Not 'is it clever' — would you, at 2am, click it. Then we spend whatever it takes to make the first 30 seconds undeniable, because if you lose them there, the rest of the video never existed.",
      register: 'conversational',
      citations: [{
        type: 'video',
        title: 'Lex Fridman #351',
        timestamp: '00:22:10',
        date: 'Jan 2023',
        excerpt: 'I obsess over the first minute more than anything else in the video.'
      }]
    }
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/landing/Landing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Landing() {
  const {
    FigureCard,
    CitationCard,
    DisclosureBanner,
    MessageBubble
  } = window.SymposiumDesignSystem_7c9615;
  const Label = ({
    children,
    style
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      ...style
    }
  }, children);
  const roster = [{
    name: 'Albert Einstein',
    era: '1879–1955',
    categories: ['Scientists'],
    fields: ['Physics'],
    description: 'Grounded in his papers, essays and letters.'
  }, {
    name: 'Marcus Aurelius',
    era: '121–180 CE',
    categories: ['Philosophers'],
    fields: ['Stoicism'],
    description: 'Grounded in the Meditations and letters to Fronto.'
  }, {
    name: 'Frederick Douglass',
    era: '1818–1895',
    categories: ['Reformers'],
    fields: ['Rhetoric'],
    description: 'Grounded in his narratives and collected speeches.'
  }, {
    name: 'Joe Rogan',
    era: 'Creator',
    kind: 'creator',
    categories: ['Creators'],
    fields: ['Podcasts'],
    description: 'Grounded in 612 hours of long-form conversation.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '20px var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-md)',
      letterSpacing: '0.08em'
    }
  }, "SYMPOSIUM"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#roster",
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      border: 'none'
    }
  }, "The roster"), /*#__PURE__*/React.createElement("a", {
    href: "#ethics",
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      border: 'none'
    }
  }, "Ethics"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.06em',
      background: 'var(--ink-1)',
      color: 'var(--ink-inverse)',
      borderRadius: 'var(--radius-1)',
      padding: '9px 18px',
      border: 'none'
    }
  }, "ENTER"))), /*#__PURE__*/React.createElement("header", {
    style: {
      textAlign: 'center',
      padding: 'var(--space-9) var(--space-6) var(--space-8)',
      borderBottom: '1px solid var(--stone-line)'
    }
  }, /*#__PURE__*/React.createElement(Label, null, "An archive that answers back"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--text-3xl)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-display)',
      maxWidth: 820,
      margin: '16px auto 0'
    }
  }, "Converse with the people behind the books, the speeches, the episodes."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-md)',
      color: 'var(--text-secondary)',
      maxWidth: 560,
      margin: '20px auto 0',
      lineHeight: 1.6
    }
  }, "Each recreation is built only from its subject's own corpus \u2014 and every reply cites the passage it drew on."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.06em',
      background: 'var(--ink-1)',
      color: 'var(--ink-inverse)',
      borderRadius: 'var(--radius-1)',
      padding: '13px 26px',
      border: 'none'
    }
  }, "BEGIN A CONVERSATION"), /*#__PURE__*/React.createElement("a", {
    href: "#promise",
    style: {
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.06em',
      color: 'var(--text-body)',
      border: '1px solid var(--stone-line-strong)',
      borderRadius: 'var(--radius-1)',
      padding: '13px 26px',
      background: 'var(--surface-card)'
    }
  }, "HOW IT WORKS"))), /*#__PURE__*/React.createElement("section", {
    id: "promise",
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6)',
      display: 'grid',
      gridTemplateColumns: '5fr 6fr',
      gap: 'var(--space-7)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    style: {
      color: 'var(--bronze-deep)'
    }
  }, "The promise"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--text-2xl)',
      lineHeight: 1.2,
      margin: '10px 0 0'
    }
  }, "Every reply cites its source."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--leading-body)',
      marginTop: 14,
      maxWidth: '48ch'
    }
  }, "Before a persona says a word, the most relevant passages are retrieved from its corpus. The reply is written from those passages \u2014 and shows them to you. Books cite chapter and page. Videos deep-link to the exact timestamp. Where the corpus is silent, the recreation says so rather than guessing.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(MessageBubble, {
    role: "user"
  }, "What convinced you natural selection was real?"), /*#__PURE__*/React.createElement(MessageBubble, {
    role: "assistant",
    author: "Charles Darwin",
    citations: [/*#__PURE__*/React.createElement(CitationCard, {
      key: "c",
      type: "book",
      title: "On the Origin of Species",
      locator: "ch. 4",
      excerpt: "Natural selection acts solely by accumulating slight successive favourable variations."
    })]
  }, "It was the accumulation of small facts that persuaded me \u2014 the finches of the Gal\xE1pagos, each island with its own beak; the barnacles I dissected for eight years."))), /*#__PURE__*/React.createElement("section", {
    id: "roster",
    style: {
      background: 'var(--surface-raised)',
      borderTop: '1px solid var(--stone-line)',
      borderBottom: '1px solid var(--stone-line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Label, null, "The roster"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--text-2xl)',
      margin: '10px 0 0'
    }
  }, "Twenty-seven voices, one rule."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-secondary)',
      marginTop: 10
    }
  }, "Historical figures grounded in their books. Creators grounded in their episodes and posts.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-6)',
      alignItems: 'start'
    }
  }, roster.map(f => /*#__PURE__*/React.createElement(FigureCard, _extends({
    key: f.name
  }, f)))))), /*#__PURE__*/React.createElement("section", {
    id: "ethics",
    style: {
      maxWidth: 760,
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Label, null, "On recreating a person"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--text-2xl)',
      margin: '10px 0 0'
    }
  }, "Honest about what this is."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--leading-body)',
      marginTop: 14,
      maxWidth: '54ch',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }, "These are interpretations built from documented words \u2014 not the people, and not their estates' voices. Every conversation carries a disclosure. Every source is inspectable. Creators with multiple registers are labeled by which voice a reply draws from."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(DisclosureBanner, null))), /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-1)',
      color: 'var(--ink-inverse)',
      textAlign: 'center',
      padding: 'var(--space-7) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      letterSpacing: '0.08em'
    }
  }, "SYMPOSIUM"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      marginTop: 10
    }
  }, "Grounded in their own words \xB7 symposium.ai")));
}
window.Landing = Landing;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Landing.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CitationCard = __ds_scope.CitationCard;

__ds_ns.Composer = __ds_scope.Composer;

__ds_ns.MessageBubble = __ds_scope.MessageBubble;

__ds_ns.RegisterIndicator = __ds_scope.RegisterIndicator;

__ds_ns.SessionSidebar = __ds_scope.SessionSidebar;

__ds_ns.TypingIndicator = __ds_scope.TypingIndicator;

__ds_ns.CategoryTabs = __ds_scope.CategoryTabs;

__ds_ns.FigureCard = __ds_scope.FigureCard;

__ds_ns.SuggestedQuestion = __ds_scope.SuggestedQuestion;

__ds_ns.DisclosureBanner = __ds_scope.DisclosureBanner;

__ds_ns.SourcesPanel = __ds_scope.SourcesPanel;

})();
