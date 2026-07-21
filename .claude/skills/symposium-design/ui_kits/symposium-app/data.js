// Shared demo content for the Symposium UI kit.
window.SYM_DATA = {
  figures: [
    { id: "marcus", name: "Marcus Aurelius", category: "historical", accentColor: "#40507A", meta: "Stoic · 121–180 AD", status: "published",
      description: "Roman emperor and Stoic. Speaks from the Meditations — on duty, mortality, and the discipline of the mind.",
      openers: [
        "How should I respond when I cannot control what happens to me?",
        "What does a good life require of me each morning?",
        "How do you make peace with death?",
      ] },
    { id: "einstein", name: "Albert Einstein", category: "historical", accentColor: "#3B6E7A", meta: "Physicist · 1879–1955", status: "published",
      description: "Built from letters, essays, and lectures. On curiosity, relativity, and the moral duty of the scientist.",
      openers: [
        "Why do you say imagination matters more than knowledge?",
        "What did discovering relativity actually feel like?",
        "Should scientists concern themselves with politics?",
      ] },
    { id: "churchill", name: "Winston Churchill", category: "historical", accentColor: "#7A5230", meta: "Statesman · 1874–1965", status: "published",
      description: "Drawn from speeches, histories, and wartime correspondence. On resolve, rhetoric, and dark hours.",
      openers: [
        "How do you find courage when everything looks lost?",
        "What makes a speech move a nation?",
        "Was there a moment you nearly gave up?",
      ] },
    { id: "seneca", name: "Seneca", category: "historical", accentColor: "#5B6E43", meta: "Stoic · 4 BC–65 AD", status: "coming-soon",
      description: "Statesman, playwright, and Stoic. Letters on time, wealth, and how to live before you die.",
      openers: [] },
    { id: "austen", name: "Jane Austen", category: "historical", accentColor: "#8A5A6E", meta: "Novelist · 1775–1817", status: "coming-soon",
      description: "From the novels and surviving letters — on society, wit, marriage, and the observing eye.",
      openers: [] },

    { id: "veritasium", name: "Veritasium", category: "creator", accentColor: "#2A6DF4", meta: "Science & Education", status: "published",
      description: "Derek Muller's science channel. Built from video transcripts — physics, engineering, and counterintuitive truths.",
      openers: [
        "Is the universe deterministic?",
        "Why do misconceptions stick so hard?",
        "What's the most surprising thing you've filmed?",
      ] },
    { id: "kurzgesagt", name: "Kurzgesagt", category: "creator", accentColor: "#E0563B", meta: "Science & Education", status: "published",
      description: "In a Nutshell. Big questions, answered in bird-sized pieces — from the channel's narrated scripts.",
      openers: [
        "Are we alone in the universe?",
        "Is it too late to stop climate change?",
        "What would happen if I fell into a black hole?",
      ] },
    { id: "huberman", name: "Andrew Huberman", category: "creator", accentColor: "#1F8A70", meta: "Health & Science", status: "coming-soon",
      description: "Neuroscience for daily life, from the podcast transcripts — sleep, focus, dopamine, and protocols.",
      openers: [] },
    { id: "mkbhd", name: "MKBHD", category: "creator", accentColor: "#C4302B", meta: "Technology", status: "coming-soon",
      description: "Marques Brownlee on consumer tech. Built from a decade of review transcripts.",
      openers: [] },
  ],

  sessions: [
    { id: "s1", title: "On facing hardship", figure: "Marcus Aurelius", time: "just now", accentColor: "#40507A", figureId: "marcus" },
    { id: "s2", title: "Is the universe deterministic?", figure: "Veritasium", time: "2h ago", accentColor: "#2A6DF4", figureId: "veritasium" },
    { id: "s3", title: "Courage in dark hours", figure: "Churchill", time: "Yesterday", accentColor: "#7A5230", figureId: "churchill" },
    { id: "s4", title: "Imagination vs. knowledge", figure: "Einstein", time: "Mon", accentColor: "#3B6E7A", figureId: "einstein" },
  ],

  // canned assistant replies keyed by figureId
  replies: {
    marcus: {
      text: "Consider that every obstacle carries within it the material for its own overcoming. You suffer not from the thing itself, but from your judgement of it — and the judgement is yours to revise. Meet the morning by asking only what is within your power; spend nothing on what is not.",
      citations: [
        { variant: "book", excerpt: "The impediment to action advances action. What stands in the way becomes the way.", source: "Meditations", detail: "Book V, 20" },
        { variant: "book", excerpt: "You have power over your mind — not outside events. Realize this, and you will find strength.", source: "Meditations", detail: "Book IV, 3" },
      ],
    },
    veritasium: {
      text: "That depends on what you mean by determinism. Classical mechanics is deterministic in principle — give me the exact state and I'll give you the future. But quantum mechanics resists that picture, and even in classical systems, chaos makes prediction practically impossible. The universe may be lawful without being predictable.",
      citations: [
        { variant: "video", excerpt: "The universe is not obligated to make sense to you — but it is astonishingly consistent.", videoTitle: "Is Reality Real?", timestamp: "12:34", channelColor: "#2A6DF4", href: "#" },
        { variant: "video", excerpt: "Chaos means deterministic systems can still be fundamentally unpredictable.", videoTitle: "The Butterfly Effect", timestamp: "07:52", channelColor: "#2A6DF4", href: "#" },
      ],
    },
    churchill: {
      text: "Courage is rightly esteemed the first of human qualities because it is the quality which guarantees all others. When the hour is darkest, you do not manufacture hope from nothing — you find the next hard thing that must be done, and you do it, and then the one after. Never yield except to convictions of honour and good sense.",
      citations: [
        { variant: "book", excerpt: "Success is not final, failure is not fatal: it is the courage to continue that counts.", source: "Speeches & Writings", detail: "Attributed, 1941" },
      ],
    },
    einstein: {
      text: "Because knowledge is bounded by what we have already found, while imagination reaches toward everything we have not. I did not arrive at relativity by reasoning in straight lines; I imagined riding alongside a beam of light and asked what I would see. The rigor comes after — but the leap comes first.",
      citations: [
        { variant: "book", excerpt: "Imagination is more important than knowledge. Knowledge is limited; imagination encircles the world.", source: "On Cosmic Religion", detail: "1931" },
      ],
    },
  },
};
