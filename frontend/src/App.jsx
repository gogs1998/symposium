import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [figures, setFigures] = useState([])
  const [selectedFigures, setSelectedFigures] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationIds, setConversationIds] = useState({})
  const [showCitations, setShowCitations] = useState(true)
  const [chatMode, setChatMode] = useState(false) // false = selection, true = chatting
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadFigures()
  }, [])

  useEffect(() => {
    // Only auto-scroll if user is already near bottom (within 100px)
    const container = messagesEndRef.current?.parentElement
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (isNearBottom) {
        scrollToBottom()
      }
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadFigures = async () => {
    try {
      console.log('API_BASE:', API_BASE)
      const response = await axios.get(`${API_BASE}/figures`)
      console.log('Response:', response.data)

      // Make sure response.data is an array
      if (Array.isArray(response.data)) {
        setFigures(response.data)
      } else {
        console.error('API returned non-array:', response.data)
        setFigures([])
      }
    } catch (error) {
      console.error('Error loading figures:', error)
      console.error('API_BASE was:', API_BASE)
      setFigures([])
    }
  }

  const toggleFigureSelection = (figure) => {
    setSelectedFigures(prev => {
      const isSelected = prev.some(f => f.id === figure.id)
      if (isSelected) {
        return prev.filter(f => f.id !== figure.id)
      } else {
        return [...prev, figure]
      }
    })
  }

  const startChat = () => {
    if (selectedFigures.length === 0) return

    setChatMode(true)
    const greeting = selectedFigures.length === 1
      ? `Hello! I'm ${selectedFigures[0].name}. ${selectedFigures[0].description}. What would you like to discuss?`
      : `Welcome to the panel discussion! You're speaking with: ${selectedFigures.map(f => f.name).join(', ')}. Ask anything and each will share their perspective.`

    setMessages([{
      role: 'system',
      content: greeting
    }])
    setConversationIds({})
  }

  const backToSelection = () => {
    setChatMode(false)
    setMessages([])
    setSelectedFigures([])
    setConversationIds({})
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || selectedFigures.length === 0 || loading) return

    const userMessage = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // Parse @mentions to see if user is addressing specific figures
      const mentionRegex = /@(\w+)/g
      const mentions = [...currentInput.matchAll(mentionRegex)].map(m => m[1].toLowerCase())

      // Filter figures based on @mentions
      let figuresToQuery = selectedFigures
      if (mentions.length > 0) {
        figuresToQuery = selectedFigures.filter(fig =>
          mentions.some(mention =>
            fig.name.toLowerCase().includes(mention) ||
            fig.id.toLowerCase().includes(mention)
          )
        )
        // If no matches, query all (maybe they mistyped)
        if (figuresToQuery.length === 0) {
          figuresToQuery = selectedFigures
        }
      }

      // Get responses from each figure sequentially
      // Build up context so each figure can see what the previous ones said
      const panelResponses = []
      const newConversationIds = { ...conversationIds }

      for (let i = 0; i < figuresToQuery.length; i++) {
        const figure = figuresToQuery[i]

        try {
          // For figures after the first, include what others have said
          let messageToSend = currentInput
          if (panelResponses.length > 0) {
            // Add context about what other panel members said
            const previousResponses = panelResponses
              .map(r => `${r.figureName}: "${r.content}"`)
              .join('\n\n')

            messageToSend = `The user asked: "${currentInput}"\n\nOther panel members have already responded:\n\n${previousResponses}\n\nNow, please give your perspective. You may agree, disagree, or build upon what others have said.`
          }

          const response = await axios.post(`${API_BASE}/chat`, {
            figure: figure.id,
            message: messageToSend,
            conversation_id: newConversationIds[figure.id],
            include_citations: showCitations
          })

          const assistantMessage = {
            role: 'assistant',
            content: response.data.message,
            figure: figure.id,
            figureName: figure.name,
            citations: response.data.citations
          }

          panelResponses.push(assistantMessage)
          newConversationIds[figure.id] = response.data.conversation_id

          // Update messages incrementally so user sees responses as they arrive
          setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
          console.error(`Error getting response from ${figure.name}:`, error)
          const errorMessage = {
            role: 'system',
            content: `Error getting response from ${figure.name}. They may be unavailable.`
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }

      setConversationIds(newConversationIds)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'system',
        content: 'Sorry, there was an error processing your message. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatCitations = (citations) => {
    if (!citations || citations.length === 0) return null

    return (
      <div className="citations">
        <div className="citations-title">Sources:</div>
        {citations.map((citation, idx) => (
          <div key={idx} className="citation">
            <strong>{citation.source}</strong>: {citation.excerpt}
          </div>
        ))}
      </div>
    )
  }

  const getAllCategories = () => {
    const categoriesSet = new Set()
    figures.forEach(figure => {
      if (figure.categories) {
        figure.categories.forEach(cat => categoriesSet.add(cat))
      }
    })
    return Array.from(categoriesSet).sort()
  }

  const filteredFigures = selectedCategory
    ? figures.filter(fig => fig.categories && fig.categories.includes(selectedCategory))
    : figures

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏛️ Symposium.ai</h1>
        <p className="tagline">Conversations with History's Greatest Minds</p>
      </header>

      <div className="app-container">
        {!chatMode ? (
          <div className="figure-selection">
            <h2>Choose Historical Figures for Discussion</h2>
            <p className="selection-hint">
              Select one or more figures. Multiple figures will engage in panel discussions where they can respond to each other!
            </p>

            <div className="category-filters">
              <button
                className={`category-button ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All ({figures.length})
              </button>
              {getAllCategories().map(category => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({figures.filter(f => f.categories && f.categories.includes(category)).length})
                </button>
              ))}
            </div>

            {selectedFigures.length > 0 && (
              <div className="selection-summary">
                <div className="selected-count">
                  Selected: {selectedFigures.map(f => f.name).join(', ')}
                </div>
                <button className="start-chat-button" onClick={startChat}>
                  {selectedFigures.length === 1 ? 'Start Conversation' : `Start Panel Discussion (${selectedFigures.length})`}
                </button>
              </div>
            )}

            <div className="figures-grid">
              {filteredFigures.map(figure => {
                const isSelected = selectedFigures.some(f => f.id === figure.id)
                return (
                  <div
                    key={figure.id}
                    className={`figure-card ${!figure.available ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => figure.available && toggleFigureSelection(figure)}
                  >
                    <div className="selection-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={!figure.available}
                      />
                    </div>
                    <h3>{figure.name}</h3>
                    <p className="figure-era">{figure.era}</p>
                    <p className="figure-description">{figure.description}</p>
                    {figure.categories && figure.categories.length > 0 && (
                      <div className="figure-categories">
                        {figure.categories.map(cat => (
                          <span key={cat} className="category-tag">{cat}</span>
                        ))}
                      </div>
                    )}
                    <div className="figure-fields">
                      {figure.fields.map(field => (
                        <span key={field} className="field-tag">{field}</span>
                      ))}
                    </div>
                    {!figure.available && (
                      <div className="unavailable-badge">No sources available</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="chat-container">
            <div className="chat-header">
              <div className="current-figure">
                <h2>
                  {selectedFigures.length === 1
                    ? selectedFigures[0].name
                    : `Panel Discussion (${selectedFigures.length})`}
                </h2>
                <p>
                  {selectedFigures.length === 1
                    ? selectedFigures[0].era
                    : selectedFigures.map(f => f.name).join(', ')}
                </p>
              </div>
              <div className="chat-controls">
                <button
                  className="toggle-button"
                  onClick={() => setShowCitations(!showCitations)}
                  title={showCitations ? "Hide sources" : "Show sources"}
                >
                  {showCitations ? "📚 Hide Sources" : "📚 Show Sources"}
                </button>
                <button
                  className="back-button"
                  onClick={backToSelection}
                >
                  ← Change Figures
                </button>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((message, idx) => (
                <div key={idx} className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.role === 'assistant' && message.figureName && (
                      <div className="message-author">{message.figureName}</div>
                    )}
                    <div className="message-text">{message.content}</div>
                    {showCitations && message.citations && formatCitations(message.citations)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-content">
                    <div className="message-author">Panel members responding...</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="input-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedFigures.length === 1
                  ? `Ask ${selectedFigures[0].name} anything...`
                  : `Ask the panel... (use @name to address specific members)`}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
