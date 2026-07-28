// The five roster categories. `tab` is the roster filter label; `label` the
// per-card badge word; `hist` marks the era-based bucket (warm palette + "era" meta).
// Order here is the tab order.
export const CATEGORIES = {
  historical: { tab: 'Historical', label: 'Historical', hist: true },
  founder: { tab: 'Founders', label: 'Founder' },
  politics: { tab: 'Leaders & Politics', label: 'Leader' },
  culture: { tab: 'Creators & Culture', label: 'Culture' },
  science: { tab: 'Science & Ideas', label: 'Science' },
}

// Deterministic accent hue for a figure when the API supplies none.
// Warm/era palette for historical, cooler modern hues for everyone else.
const HIST_HUES = ['#40507A', '#3B6E7A', '#7A5230', '#5B6E43', '#8A5A6E', '#4A5A6E']
const MODERN_HUES = ['#2A6DF4', '#E0563B', '#1F8A70', '#C4302B', '#6A4CB8', '#0E7C86']

function hueFor(id, palette) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export function adaptFigure(f) {
  const m = f.metadata || {}
  // Category comes from metadata; fall back to the old type field for any figure
  // not yet migrated ("creator" -> culture, else historical).
  const category = CATEGORIES[m.category] ? m.category : (f.type === 'creator' ? 'culture' : 'historical')
  const isHist = CATEGORIES[category].hist
  const meta = isHist
    ? (m.era || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || 'Historical')
    : (m.channel || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || CATEGORIES[category].label)
  return {
    id: f.id,
    name: f.name,
    description: f.description || '',
    category,
    accentColor: hueFor(f.id, isHist ? HIST_HUES : MODERN_HUES),
    meta,
    fields: Array.isArray(m.fields) ? m.fields : [],
    status: f.chunk_count > 0 ? 'published' : 'coming-soon',
    chunkCount: f.chunk_count,
    // Etched portrait served from /public/portraits/<id>.png. Missing files 404 and
    // FigurePortrait falls back to the monogram plate (onError), so this is always safe.
    imageUrl: `/portraits/${f.id}.png`,
    // static opener prompts per figure could come from the API later; empty for now.
    openers: Array.isArray(m.openers) ? m.openers : [],
    // creator delivery format (e.g. "podcast", "speeches+rallies", "interviews+x"),
    // used to derive the display register; absent for most figures.
    format: typeof m.format === 'string' ? m.format : '',
  }
}

// Which "voice" a figure's replies draw from, derived from metadata.format.
// Display-only for now (no register switching). Returns { registers, active } or
// null for historical figures / anyone without a delivery format.
export function registersFor(figure) {
  if (!figure || figure.category === 'historical' || !figure.format) return null
  const fmt = (figure.format || '').toLowerCase()
  let active = 'on-camera'          // default creator voice: scripted, on-camera
  if (fmt.includes('podcast') || fmt.includes('interview')) active = 'conversational'
  else if (fmt.includes('written') || fmt.includes('post') || fmt.includes('book')) active = 'written'
  // Only surface registers the metadata supports; the active one is always present.
  const registers = [active]
  return { registers, active }
}

// Shape the flat GET /figures/{id}/sources payload into the SourcesPanel's
// books/videos/collections model. The endpoint classifies each corpus item as
// "video" or "document"; documents become "books", videos become "videos", and
// the log detail (e.g. "143 chunks") is shown as the size/duration line.
export function adaptSources(payload) {
  const sources = Array.isArray(payload?.sources) ? payload.sources : []
  const books = []
  const videos = []
  for (const s of sources) {
    if (s.kind === 'video') videos.push({ title: s.item_id, duration: s.detail })
    else books.push({ title: s.item_id, size: s.detail })
  }
  const parts = []
  if (books.length) parts.push(`${books.length} document${books.length === 1 ? '' : 's'}`)
  if (videos.length) parts.push(`${videos.length} video${videos.length === 1 ? '' : 's'}`)
  return { books, videos, collections: [], totals: parts.join(' · ') }
}

export function formatTimestamp(totalSeconds) {
  const s = Math.floor(totalSeconds || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function adaptCitation(c, channelColor) {
  const md = c.metadata || {}
  const isVideo = !!md.video_id
  if (isVideo) {
    const start = Math.floor(md.start_seconds || 0)
    return {
      variant: 'video',
      excerpt: c.excerpt,
      videoTitle: md.source || c.source,
      timestamp: formatTimestamp(md.start_seconds || 0),
      href: md.url ? `${md.url}${md.url.includes('?') ? '&' : '?'}t=${start}s` : '#',
      channelColor,
      thumbnail: md.thumbnail || undefined,
    }
  }
  return {
    variant: 'book',
    excerpt: c.excerpt,
    source: c.source,
    detail: md.locator || md.detail || undefined,
  }
}
