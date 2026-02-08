import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CommandBar.css'

const EXAMPLE_QUERIES = [
  "What changed today?",
  "Who needs to know about the new pricing?",
  "Show blockers for mobile launch",
  "Summarize recent decisions",
  "What does Sarah know?",
  "Find conflicts in the system"
]

export default function CommandBar({ onQuery, isProcessing }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Open with Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle arrow keys for suggestion navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, EXAMPLE_QUERIES.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim()) {
        handleSubmit()
      } else if (EXAMPLE_QUERIES[selectedIndex]) {
        handleExampleClick(EXAMPLE_QUERIES[selectedIndex])
      }
    }
  }

  const handleSubmit = () => {
    if (query.trim() && onQuery) {
      onQuery(query)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleExampleClick = (example) => {
    setQuery(example)
    if (onQuery) {
      onQuery(example)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button 
        className="command-trigger"
        onClick={() => setIsOpen(true)}
        title="Open command bar (⌘K)"
      >
        <span className="command-icon">⌘</span>
        <span className="command-text">Ask anything...</span>
        <kbd className="command-kbd">⌘K</kbd>
      </button>

      {/* Command Bar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="command-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Command Bar */}
            <motion.div
              className="command-bar"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Input */}
              <div className="command-input-wrapper">
                <span className="command-search-icon">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="command-input"
                  placeholder="Ask anything... Try 'What changed today?'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="command-spinner" />
                )}
              </div>

              {/* Suggestions */}
              <div className="command-suggestions">
                <div className="suggestions-label">Try asking:</div>
                {EXAMPLE_QUERIES.map((example, index) => (
                  <button
                    key={example}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleExampleClick(example)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="suggestion-icon">💬</span>
                    <span className="suggestion-text">{example}</span>
                    {index === selectedIndex && (
                      <span className="suggestion-hint">↵</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="command-footer">
                <div className="command-hints">
                  <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                  <span><kbd>↵</kbd> select</span>
                  <span><kbd>esc</kbd> close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
