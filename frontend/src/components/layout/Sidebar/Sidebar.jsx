import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IntelligencePanel from '../../features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../../features/KnowledgeGraph/KnowledgeGraph'
import './Sidebar.css'
import useVoiceInput from '../../../hooks/useVoiceInput' // Import custom hook

export default function Sidebar({ onQuery, processing, queryResult, onClearQuery }) {
  const [question, setQuestion] = useState('')
  const [visualMode, setVisualMode] = useState('default')
  const [expandedGraph, setExpandedGraph] = useState(false)

  // Voice Input Hooks
  const { isListening, transcript, startListening, stopListening, error: voiceError } = useVoiceInput();

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setQuestion(prev => (prev ? prev + ' ' + transcript : transcript));
    }
  }, [transcript]);

  // TTS Helper
  const toggleTTS = async (text) => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!text) return;

    try {
      setIsPlaying(true);
      const response = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 1000) }) // Limit length for demo
      });

      if (!response.ok) throw new Error("TTS failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      audioRef.current = audio;
      audio.play();
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Auto-switch visual mode logic... [Same as before]
  useEffect(() => {
    if (queryResult?.brief) {
      const brief = queryResult.brief;
      const hasRisks = Array.isArray(brief.risks) && brief.risks.length > 0;
      const riskCount = brief.executive_insight?.risks > 0;

      if (hasRisks || riskCount) {
        setVisualMode('impact')
      } else {
        const scopeTimeframe = typeof brief.scope === 'string' ? brief.scope : brief.scope?.timeframe;
        if (scopeTimeframe?.includes('24h') || scopeTimeframe?.includes('week') || scopeTimeframe?.includes('Today')) {
          setVisualMode('timeline')
        }
      }
    }
  }, [queryResult])

  const handleAsk = (e) => {
    e?.preventDefault()
    if (!question.trim()) return
    onQuery?.(question)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const hasResult = !!queryResult?.brief
  const visualData = queryResult?.visual_reasoning
  const answer = queryResult?.answer || queryResult?.result

  const handleClearAnswer = () => {
    setQuestion('')
    if (onClearQuery) onClearQuery()
    // Stop audio if clearing
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }

  const [showFullAnswer, setShowFullAnswer] = useState(false);

  useEffect(() => {
    setShowFullAnswer(false);
  }, [queryResult]);

  const renderMarkdown = (text) => {
    if (!text) return text;
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/^\d+\.\s+/gm, '');
    return formatted;
  };

  const getCondensedSummary = (answer) => {
    if (!answer) return null;
    const teamsMatch = answer.match(/(\d+)\s+team/i);
    const risksMatch = answer.match(/(\d+)\s+(critical\s+)?risk/i);
    const blockedMatch = answer.match(/blocked for (\d+\s+\w+)/i);

    return {
      teams: teamsMatch ? teamsMatch[1] : null,
      risks: risksMatch ? risksMatch[1] : null,
      blocked: blockedMatch ? blockedMatch[1] : null,
      firstLine: answer.split('\n')[0] || answer.substring(0, 100)
    };
  };

  const summary = answer ? getCondensedSummary(answer) : null;

  return (
    <aside className="sidebar-ask">
      <div className="sidebar-header">
        <h2>Ask anything</h2>
        <p>Your intelligence partner for organizational context.</p>
      </div>

      <div className="ask-box-container">
        <textarea
          className="ask-input"
          placeholder="Ask your digital Chief of Staff..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={processing || isListening}
          rows={3}
        />

        {/* Input Actions Row */}
        <div className="ask-actions">
          {/* Mic Button */}
          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            title="Voice Input"
          >
            {isListening ? '🔴 Listening...' : '🎤'}
          </button>

          <button
            className="ask-submit-btn"
            onClick={handleAsk}
            disabled={processing || !question.trim()}
          >
            {processing ? 'Thinking...' : 'Ask Organization'}
          </button>
        </div>

        {/* Smart Prompts */}
        <div className="smart-prompts">
          <span className="prompt-label">Try asking:</span>
          <div className="prompt-list" style={{ display: 'grid', gap: '8px' }}>
            {[
              "Who is blocked?",
              "What changed today?",
              "What are the biggest risks?"
            ].map((prompt, i) => (
              <button
                key={i}
                className="prompt-chip"
                onClick={() => setQuestion(prompt)}
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Answer Box */}
          {(hasResult || processing) && (
            <div className="sidebar-answer-box">
              <div className="answer-header">
                <div className="answer-header-left">
                  <span className="answer-icon">✨</span>
                  <span className="answer-title">AI Analysis</span>
                </div>
                {hasResult && (
                  <button className="answer-close-btn" onClick={handleClearAnswer} title="Clear answer">
                    ✕
                  </button>
                )}
              </div>

              {/* Audio Control Bar (Only if result exists) */}
              {hasResult && answer && (
                <div className="audio-control-bar">
                  <button
                    className={`audio-play-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={() => toggleTTS(renderMarkdown(answer).replace(/<[^>]*>/g, ''))} // Strip HTML for TTS
                  >
                    {isPlaying ? '⏹ Stop Audio' : '▶️ Read Aloud'}
                  </button>
                </div>
              )}

              <div className="answer-content">
                {processing ? (
                  <span className="typing-indicator">Analyzing...</span>
                ) : summary ? (
                  <>
                    <div className="answer-summary">
                      {summary.teams && (
                        <div className="summary-stat">
                          <strong>{summary.teams}</strong> teams blocked
                        </div>
                      )}
                      {summary.risks && (
                        <div className="summary-stat risk">
                          <strong>{summary.risks}</strong> revenue risk{summary.risks > 1 ? 's' : ''}
                        </div>
                      )}
                      {summary.blocked && (
                        <div className="summary-detail">
                          Primary issue: {summary.blocked}
                        </div>
                      )}
                    </div>
                    {!showFullAnswer && (
                      <button className="show-more-btn" onClick={() => setShowFullAnswer(true)}>
                        Show full analysis →
                      </button>
                    )}
                    {showFullAnswer && (
                      <>
                        <div
                          className="answer-text-full"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
                        />
                        <button className="show-less-btn" onClick={() => setShowFullAnswer(false)}>
                          Show less ↑
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="answer-text">
                    {answer || "No information available at this time."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-results"></div>
    </aside>
  )
}
