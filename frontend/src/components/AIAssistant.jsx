import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AIAssistant.css';
import { generateRichResponse } from '../assistant/engine';

// Simple rolling memory + summarizer (placeholder)
function summarize(messages) {
  // Naive summarization: pick first bot intro + last two user intents
  const userMsgs = messages.filter(m => m.type === 'user').slice(-3).map(m => m.text);
  if (userMsgs.length === 0) return 'User just started.';
  return 'Recent focuses: ' + userMsgs.join(' | ');
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1,
    type: 'bot',
    text: "Namaste! I'm Yatra, your personal travel assistant. Ask me about destinations, festivals, budgeting, cuisine, transport, weather, or planning strategies.",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memorySummary, setMemorySummary] = useState('');
  const streamingRef = useRef(null);
  const containerRef = useRef(null);
  const [lastBotFull, setLastBotFull] = useState('');
  const [refining, setRefining] = useState(false);

  const quickActions = [
    { icon: '🏛️', text: 'Popular Destinations', action: 'destinations' },
    { icon: '🎭', text: 'Festival Calendar', action: 'festivals' },
    { icon: '💰', text: 'Budget Planning', action: 'budget' },
    { icon: '🍛', text: 'Local Cuisine', action: 'cuisine' },
    { icon: '🌤️', text: 'Weather Info', action: 'weather' },
    { icon: '🚗', text: 'Transportation', action: 'transport' }
  ];

  const appendMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isTyping) return;

    const now = Date.now();
    const userMessage = { id: now, type: 'user', text: message.trim(), timestamp: new Date() };
    appendMessage(userMessage);
    setInputValue('');

    // Update memory summary every few interactions
    setMemorySummary(prev => summarize([...messages, userMessage]));
    setIsTyping(true);

    // Generate full response immediately (non-stream) then stream out tokens for UX
  const full = generateRichResponse(message, { memory: memorySummary });
  setLastBotFull(full);
    const botId = now + 1;
    const tokens = full.split(/(\s+)/); // keep whitespace tokens for natural spacing
    let assembled = '';
    let idx = 0;
    const start = () => {
      streamingRef.current = setInterval(() => {
        if (idx >= tokens.length) {
          clearInterval(streamingRef.current);
          streamingRef.current = null;
          setIsTyping(false);
          return;
        }
        assembled += tokens[idx++];
        setMessages(prev => {
          // If bot placeholder exists, update it; else append
          const exists = prev.find(m => m.id === botId);
            if (exists) {
              return prev.map(m => m.id === botId ? { ...m, text: assembled } : m);
            }
            return [...prev, { id: botId, type: 'bot', text: assembled, timestamp: new Date() }];
        });
      }, 25);
    };
    start();
  };

    const refineLast = () => {
      if (!lastBotFull || refining || isTyping) return;
      setRefining(true);
      const focusPrompt = 'refine ' + (lastBotFull.split('\n')[0].slice(0,80));
      handleSendMessage(focusPrompt);
      setTimeout(()=> setRefining(false), 500); // allow re-use after dispatch
    };

  // Quick action now just sends the canonical keyword which engine interprets

  const handleQuickAction = (action) => handleSendMessage(action);

  const handleSuggestionClick = (suggestion) => handleSendMessage(suggestion);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle ${isOpen ? 'chat-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Yatra AI Assistant"
      >
        <span className="chat-icon">
          {isOpen ? '✕' : '🤖'}
        </span>
        <span className="chat-label">Yatra</span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">🇮🇳</div>
              <div className="bot-details">
                <h3>Yatra AI Assistant</h3>
                <p>Your travel companion for incredible India</p>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" ref={containerRef}>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="message-avatar">🇮🇳</div>
                )}
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split('\n').map((line, index) => (
                      <div key={index}>
                        {line.includes('**') ? (
                          <span dangerouslySetInnerHTML={{
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Suggestions currently generated in engine not returned as structured; could extend later */}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot typing">
                <div className="message-avatar">🇮🇳</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="quick-actions">
            <div className="quick-actions-title">Quick Help:</div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.action)}
                  title={action.text}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-text">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input-container">
            <div className="refine-bar">
              <button type="button" className="refine-btn" disabled={!lastBotFull || refining || isTyping} onClick={refineLast} title="Refine last answer">
                {refining ? 'Refining...' : 'Refine'}
              </button>
            </div>
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about destinations, budgets, cuisine, routes..."
                className="chat-input"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button
                className="send-button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
              >
                <span className="send-icon">➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
