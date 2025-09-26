// AI Chatbot Component for Yatra360
import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Yatra, your AI travel assistant. How can I help you plan your perfect Indian adventure? 🌍",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "🏔️ Best places to visit in Himachal Pradesh",
    "🎭 Upcoming festivals in Rajasthan", 
    "💰 Budget for a 7-day Kerala trip",
    "🚂 Train routes to Goa"
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Predefined responses for common queries
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Travel destinations
    if (lowerMessage.includes('himachal') || lowerMessage.includes('mountains')) {
      return {
        text: "🏔️ Himachal Pradesh is perfect for mountain lovers! Here are top destinations:\n\n• **Manali** - Adventure sports & scenic beauty\n• **Shimla** - Colonial charm & pleasant weather\n• **Dharamshala** - Spiritual vibes & Dalai Lama's residence\n• **Spiti Valley** - Desert mountains & monasteries\n\nWould you like detailed itineraries or budget information for any of these?",
        suggestions: ["Manali itinerary", "Shimla budget", "Dharamshala hotels", "Spiti Valley weather"]
      };
    }

    if (lowerMessage.includes('kerala') || lowerMessage.includes('backwaters')) {
      return {
        text: "🌴 Kerala - God's Own Country! Perfect for:\n\n• **Alleppey** - Houseboat experiences\n• **Munnar** - Tea plantations & hill stations\n• **Kochi** - Historic port city\n• **Thekkady** - Wildlife sanctuary\n• **Varkala** - Beach & cliffs\n\nBest time: Oct-Mar. Average cost: ₹15,000-25,000 for 7 days.",
        suggestions: ["Kerala 7-day itinerary", "Houseboat booking", "Munnar tea gardens", "Kerala Ayurveda"]
      };
    }

    if (lowerMessage.includes('rajasthan') || lowerMessage.includes('desert')) {
      return {
        text: "🏰 Rajasthan - Land of Kings! Must-visit places:\n\n• **Jaipur** - Pink City, palaces & forts\n• **Udaipur** - City of Lakes, romantic\n• **Jodhpur** - Blue City, Mehrangarh Fort\n• **Jaisalmer** - Golden City, desert safari\n• **Pushkar** - Holy city, camel fair\n\nBest festivals: Diwali, Holi, Desert Festival!",
        suggestions: ["Rajasthan 10-day tour", "Desert safari Jaisalmer", "Palace hotels", "Festival dates"]
      };
    }

    // Budget queries
    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return {
        text: "💰 Here's a general budget guide for India travel:\n\n**Budget Traveler**: ₹1,500-2,500/day\n**Mid-range**: ₹2,500-5,000/day\n**Luxury**: ₹5,000+/day\n\n**Includes**: Accommodation, food, transport, activities\n\nWant me to create a detailed budget for your specific destination?",
        suggestions: ["Budget for Goa", "Budget for Kashmir", "Budget calculator", "Money saving tips"]
      };
    }

    // Weather queries
    if (lowerMessage.includes('weather') || lowerMessage.includes('when to visit')) {
      return {
        text: "🌤️ Best time to visit popular destinations:\n\n• **North India**: Oct-Mar (cool & pleasant)\n• **South India**: Nov-Feb (post-monsoon)\n• **Hill Stations**: Apr-Jun, Sep-Nov\n• **Beaches**: Oct-Mar (dry season)\n• **Desert**: Nov-Mar (cooler weather)\n\nWhich specific place are you planning to visit?",
        suggestions: ["Weather in Kashmir", "Monsoon travel tips", "Best season for Ladakh", "Beach weather Goa"]
      };
    }

    // Transportation
    if (lowerMessage.includes('train') || lowerMessage.includes('flight') || lowerMessage.includes('transport')) {
      return {
        text: "🚂 Transportation in India:\n\n**Trains**: Most economical, book via IRCTC\n**Flights**: Fastest, check SpiceJet, IndiGo\n**Buses**: State transport & private operators\n**Taxis**: Uber, Ola available in cities\n**Local**: Auto-rickshaws, metro, local trains\n\nNeed help with specific route planning?",
        suggestions: ["Train booking IRCTC", "Flight comparison", "Bus routes", "Local transport"]
      };
    }

    // Festivals
    if (lowerMessage.includes('festival') || lowerMessage.includes('celebration')) {
      return {
        text: "🎭 Major Indian Festivals to experience:\n\n• **Diwali** (Oct/Nov) - Festival of lights\n• **Holi** (Mar) - Festival of colors\n• **Dussehra** (Sep/Oct) - Good over evil\n• **Ganesh Chaturthi** (Aug/Sep) - Mumbai\n• **Pushkar Fair** (Nov) - Rajasthan\n• **Kumbh Mela** - Sacred gathering\n\nWhich festival interests you most?",
        suggestions: ["Diwali celebration places", "Holi best destinations", "Festival calendar 2025", "Local festivals"]
      };
    }

    // Food
    if (lowerMessage.includes('food') || lowerMessage.includes('cuisine')) {
      return {
        text: "🍛 Indian cuisine varies by region:\n\n• **North**: Butter chicken, naan, lassi\n• **South**: Dosa, sambar, coconut curry\n• **West**: Dhokla, vada pav, seafood\n• **East**: Fish curry, rosogolla, momos\n• **Street Food**: Chaat, golgappa, jalebi\n\n⚠️ Food safety tips for travelers included!",
        suggestions: ["Must-try dishes", "Vegetarian food", "Food safety tips", "Cooking classes"]
      };
    }

    // Hotels/Accommodation
    if (lowerMessage.includes('hotel') || lowerMessage.includes('stay') || lowerMessage.includes('accommodation')) {
      return {
        text: "🏨 Accommodation options in India:\n\n• **Luxury**: Taj, Oberoi, heritage hotels\n• **Mid-range**: Business hotels, boutique\n• **Budget**: Hostels, guesthouses, Zostel\n• **Unique**: Houseboats, treehouses, forts\n• **Homestays**: Experience local culture\n\nI can help you find the perfect stay!",
        suggestions: ["Palace hotels Rajasthan", "Beach resorts Goa", "Hostels in Delhi", "Homestays Kerala"]
      };
    }

    // Safety
    if (lowerMessage.includes('safe') || lowerMessage.includes('security')) {
      return {
        text: "🛡️ Safety tips for India travel:\n\n• Register with embassy if international\n• Keep copies of documents\n• Use registered taxis/transport\n• Drink bottled water\n• Respect local customs\n• Stay connected with family\n• Travel insurance recommended\n\nIndia is generally safe for tourists!",
        suggestions: ["Travel insurance", "Emergency contacts", "Health precautions", "Cultural etiquette"]
      };
    }

    // Default responses
    const defaultResponses = [
      {
        text: "I'd love to help you plan your Indian adventure! I can assist with:\n\n🗺️ **Destinations** - Best places to visit\n💰 **Budgeting** - Cost planning & tips\n🎭 **Festivals** - Cultural events & dates\n🚂 **Transport** - Trains, flights, local travel\n🏨 **Accommodation** - Hotels to homestays\n🍛 **Food** - Regional cuisines & safety\n\nWhat would you like to explore?",
        suggestions: ["Plan a trip", "Budget calculator", "Festival calendar", "Popular destinations"]
      },
      {
        text: "I can help you with travel planning, but I didn't quite understand that. Could you ask about:\n\n• Specific destinations you want to visit\n• Your budget range and duration\n• Festivals or cultural events\n• Transportation options\n• Food and accommodation\n\nWhat interests you most?",
        suggestions: ["Best destinations", "Budget planning", "Upcoming festivals", "Travel tips"]
      }
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setSuggestions(botResponse.suggestions || [
        "Plan another trip",
        "Budget tips", 
        "Festival calendar",
        "Travel safety"
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="chat-notification">AI Travel Assistant</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="bot-avatar">
              <span>🤖</span>
            </div>
            <div className="bot-info">
              <h4>Yatra AI Assistant</h4>
              <span className="status">Online • Ready to help</span>
            </div>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {formatMessage(message.text)}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about travel destinations, budgets, festivals..."
                rows={1}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="send-btn"
                aria-label="Send Message"
              >
                📤
              </button>
            </div>
            <div className="input-footer">
              <span>Powered by Yatra360 AI • Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
