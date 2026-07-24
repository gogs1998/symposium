// Deterministic accent hue for a figure when the API supplies none.
// Warm/era palette for historical, cooler channel-ish hues for creators.
const HIST_HUES = ['#40507A', '#3B6E7A', '#7A5230', '#5B6E43', '#8A5A6E', '#4A5A6E']
const CREATOR_HUES = ['#2A6DF4', '#E0563B', '#1F8A70', '#C4302B', '#6A4CB8', '#0E7C86']

function hueFor(id, palette) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export function adaptFigure(f) {
  const category = f.type === 'creator' ? 'creator' : 'historical'
  const m = f.metadata || {}
  const meta = category === 'creator'
    ? (m.channel || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || 'Creator')
    : (m.era || (Array.isArray(m.fields) ? m.fields.join(' · ') : '') || 'Historical')
  return {
    id: f.id,
    name: f.name,
    description: f.description || '',
    category,
    accentColor: hueFor(f.id, category === 'creator' ? CREATOR_HUES : HIST_HUES),
    meta,
    fields: Array.isArray(m.fields) ? m.fields : [],
    status: f.chunk_count > 0 ? 'published' : 'coming-soon',
    chunkCount: f.chunk_count,
    // Etched portrait served from /public/portraits/<id>.png. Missing files 404 and
    // FigurePortrait falls back to the monogram plate (onError), so this is always safe.
    imageUrl: `/portraits/${f.id}.png`,
    // static opener prompts per figure could come from the API later; empty for now.
    openers: Array.isArray(m.openers) ? m.openers : [],
  }
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
