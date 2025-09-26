import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../services/analytics';
import './TravelSocialFeed.css';

const TravelSocialFeed = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const { post: track } = useAnalytics();

  useEffect(() => {
    // Check authentication
    const currentUser = localStorage.getItem('user');
    if (!currentUser) {
      navigate('/login?redirect=connect');
      return;
    }
    
    const parsed = JSON.parse(currentUser);
    setUser(parsed);
    loadFeedData();
    // Analytics: user engaged connect
    track('connect_clicked', { tab: 'feed' }, 'connect');
  }, [navigate]);

  const loadFeedData = () => {
    // Mock data - replace with API calls
    const mockStories = [
      {
        id: 1,
        user: { name: 'Priya Sharma', avatar: '👩‍💼', verified: true },
        preview: '🏔️',
        timestamp: '2h ago'
      },
      {
        id: 2,
        user: { name: 'Rahul Gupta', avatar: '👨‍💻', verified: false },
        preview: '🏖️',
        timestamp: '4h ago'
      },
      {
        id: 3,
        user: { name: 'Anita Devi', avatar: '👩‍🎓', verified: true },
        preview: '🏛️',
        timestamp: '6h ago'
      }
    ];

    const mockPosts = [
      {
        id: 1,
        user: {
          name: 'Raj Patel',
          username: '@rajexplorer',
          avatar: '👨‍🚀',
          verified: true,
          location: 'Udaipur, Rajasthan'
        },
        content: {
          text: 'Just witnessed the most breathtaking sunset at Lake Pichola! The City Palace looks absolutely magical in golden hour. 🌅✨ #Udaipur #Rajasthan #IncredibleIndia',
          images: ['🏰', '🌅', '🚣‍♂️'],
          location: 'Lake Pichola, Udaipur'
        },
        engagement: {
          likes: 234,
          comments: 18,
          shares: 12,
          liked: false,
          saved: false
        },
        timestamp: '2 hours ago',
        tags: ['#Udaipur', '#Rajasthan', '#Sunset']
      },
      {
        id: 2,
        user: {
          name: 'Maya Iyer',
          username: '@southindianvibes',
          avatar: '👩‍🎨',
          verified: true,
          location: 'Alleppey, Kerala'
        },
        content: {
          text: 'Floating through the serene backwaters of Kerala on a traditional houseboat. The silence here is pure therapy for the soul 🛶💚 Best decision to disconnect and reconnect with nature!',
          images: ['🛶', '🌴', '🦆'],
          location: 'Alleppey Backwaters'
        },
        engagement: {
          likes: 189,
          comments: 24,
          shares: 8,
          liked: true,
          saved: true
        },
        timestamp: '5 hours ago',
        tags: ['#Kerala', '#Backwaters', '#Houseboat']
      },
      {
        id: 3,
        user: {
          name: 'Arjun Singh',
          username: '@mountaincaller',
          avatar: '🧗‍♂️',
          verified: false,
          location: 'Manali, Himachal Pradesh'
        },
        content: {
          text: 'Trek to Beas Kund completed! 4 days of pure adventure through valleys, streams, and snow-capped peaks. Every step was worth this view! 🏔️ Who\'s joining me for Hampta Pass next?',
          images: ['🏔️', '🥾', '⛺'],
          location: 'Beas Kund, Manali'
        },
        engagement: {
          likes: 312,
          comments: 35,
          shares: 22,
          liked: false,
          saved: false
        },
        timestamp: '1 day ago',
        tags: ['#Trekking', '#Manali', '#Adventure']
      }
    ];

    setStories(mockStories);
    setPosts(mockPosts);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              liked: !post.engagement.liked,
              likes: post.engagement.liked 
                ? post.engagement.likes - 1 
                : post.engagement.likes + 1
            }
          }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              saved: !post.engagement.saved
            }
          }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now(),
      user: {
        name: user?.name || 'You',
        username: '@' + (user?.username || 'traveler'),
        avatar: user?.avatar || '👤',
        verified: user?.verified || false,
        location: 'Current Location'
      },
      content: {
        text: newPostText,
        images: [],
        location: 'Your Location'
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        saved: false
      },
      timestamp: 'now',
      tags: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowCreatePost(false);
  };

  if (!user) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <h2>🔐 Login Required</h2>
          <p>Please login to connect with fellow travelers and share your experiences!</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/login?redirect=connect')}
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-social-feed">
      <div className="feed-header">
        <h1>✈️ Connect with Travelers</h1>
        <p>Share your journey, inspire others, and discover amazing travel stories from across India</p>
      </div>

      <div className="feed-navigation">
        <button 
          className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          🏠 Feed
        </button>
        <button 
          className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          🔍 Explore
        </button>
        <button 
          className={`nav-tab ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          👥 Communities
        </button>
      </div>

      {activeTab === 'feed' && (
        <>
          {/* Stories Section */}
          <div className="stories-section">
            <div className="stories-container">
              <div className="story-item your-story" onClick={() => setShowCreatePost(true)}>
                <div className="story-avatar">
                  <span className="avatar-emoji">{user.avatar || '👤'}</span>
                  <div className="add-story">+</div>
                </div>
                <span className="story-name">Your Story</span>
              </div>
              
              {stories.map(story => (
                <div key={story.id} className="story-item">
                  <div className="story-avatar">
                    <span className="avatar-emoji">{story.user.avatar}</span>
                    <div className="story-preview">{story.preview}</div>
                  </div>
                  <span className="story-name">{story.user.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Post */}
          {showCreatePost && (
            <div className="create-post-modal">
              <div className="create-post-container">
                <div className="create-post-header">
                  <h3>Share Your Travel Experience</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowCreatePost(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="create-post-content">
                  <div className="user-info">
                    <span className="user-avatar">{user.avatar || '👤'}</span>
                    <span className="user-name">{user.name || 'Traveler'}</span>
                  </div>
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Share your travel story, tips, or ask for recommendations..."
                    className="post-textarea"
                  />
                  <div className="post-actions">
                    <button className="action-btn">📷 Photo</button>
                    <button className="action-btn">📍 Location</button>
                    <button className="action-btn">🎭 Festival</button>
                  </div>
                  <div className="post-buttons">
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowCreatePost(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={handleCreatePost}
                      disabled={!newPostText.trim()}
                    >
                      Share Experience
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="posts-container">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="user-info">
                    <span className="user-avatar">{post.user.avatar}</span>
                    <div className="user-details">
                      <div className="user-name">
                        {post.user.name}
                        {post.user.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="user-meta">
                        <span className="username">{post.user.username}</span>
                        {post.content.location && (
                          <>
                            <span className="separator">•</span>
                            <span className="location">📍 {post.content.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="post-options">⋯</div>
                </div>

                <div className="post-content">
                  <p className="post-text">{post.content.text}</p>
                  {post.content.images.length > 0 && (
                    <div className="post-images">
                      {post.content.images.map((img, index) => (
                        <div key={index} className="post-image">
                          <span className="image-placeholder">{img}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {post.tags && (
                    <div className="post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-engagement">
                  <div className="engagement-actions">
                    <button 
                      className={`action-btn ${post.engagement.liked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      {post.engagement.liked ? '❤️' : '🤍'} {post.engagement.likes}
                    </button>
                    <button className="action-btn">
                      💬 {post.engagement.comments}
                    </button>
                    <button className="action-btn">
                      📤 {post.engagement.shares}
                    </button>
                    <button 
                      className={`action-btn save-btn ${post.engagement.saved ? 'saved' : ''}`}
                      onClick={() => handleSave(post.id)}
                    >
                      {post.engagement.saved ? '📌' : '🔖'}
                    </button>
                  </div>
                  <div className="post-timestamp">{post.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'explore' && (
        <div className="explore-section">
          <h2>🔍 Discover Travel Inspiration</h2>
          <div className="explore-grid">
            <div className="explore-category">
              <h3>🏔️ Adventure Seekers</h3>
              <p>Connect with fellow trekkers and adventure enthusiasts</p>
            </div>
            <div className="explore-category">
              <h3>📸 Photography Lovers</h3>
              <p>Share and discover stunning travel photography</p>
            </div>
            <div className="explore-category">
              <h3>🍛 Food Explorers</h3>
              <p>Discover local cuisines and hidden food gems</p>
            </div>
            <div className="explore-category">
              <h3>🏛️ History Buffs</h3>
              <p>Explore India's rich cultural heritage together</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="communities-section">
          <h2>👥 Travel Communities</h2>
          <div className="communities-grid">
            <div className="community-card">
              <h3>🌊 Beach Lovers India</h3>
              <p>2.3k members</p>
              <button className="btn-primary">Join Community</button>
            </div>
            <div className="community-card">
              <h3>🏔️ Mountain Trekkers</h3>
              <p>1.8k members</p>
              <button className="btn-primary">Join Community</button>
            </div>
            <div className="community-card">
              <h3>🎭 Festival Chasers</h3>
              <p>3.1k members</p>
              <button className="btn-primary">Join Community</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelSocialFeed;
