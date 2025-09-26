import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Attempt to load a footer background image from several candidate paths.
  // This solves the issue where '/assets/footer.jpg' didn't exist. Place your
  // desired image in /public/images/footer.jpg for the primary path.
  const [bgUrl, setBgUrl] = useState(null);
  useEffect(() => {
    const candidates = [
      '/images/footer.jpg',      // Preferred: add your custom footer.jpg here
      '/images/personalBackground.jpg',       // Fallback existing image
    ];
    let isMounted = true;
    (async () => {
      for (const src of candidates) {
        try {
          await new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res();
            img.onerror = () => rej();
            img.src = src;
          });
          if (isMounted) { setBgUrl(src); }
          break;
        } catch { /* try next */ }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <footer className="footer" style={ bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined }>
      <div className="footer-container" >
        {/* Main Footer Content (constrained width) */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <span className="logo-icon">🌍</span>
              <span className="logo-text">Yatra360</span>
            </div>
            <p className="company-description">
              Your ultimate travel companion for exploring India's incredible destinations, 
              connecting with local guides, and creating unforgettable memories.
            </p>
          </div>
          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Explore</h3>
            <ul className="footer-links">
              <li><Link to="/places">Popular Destinations</Link></li>
              <li><Link to="/guides">Travel Guides</Link></li>
              <li><Link to="/festivals">Indian Festivals</Link></li>
              <li><Link to="/itinerary">Trip Planner</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><Link to="/travel-buddy">Find Travel Buddies</Link></li>
              <li><Link to="/budget-planner">Budget Planner</Link></li>
              <li><Link to="/currency-converter">Currency Converter</Link></li>
              <li><Link to="/alerts">Travel Alerts</Link></li>
              <li><Link to="/booking">Hotel Booking</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/safety">Safety Guidelines</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
              <li><Link to="/admin">Admin</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h3 className="footer-title">Get in Touch</h3>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>info@yatra360.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>+91 1234567890</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Telangana, India</span>
            </div>
            <div className="newsletter">
              <h4>Newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" />
                <button type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Bar (full-width) */}
      <div className="emergency-bar" role="region" aria-label="Emergency contact numbers">
        <div className="emergency-inner">
          <div className="emergency-header">
            <span className="emergency-siren" aria-hidden="true">🚨</span>
            <span className="emergency-title">Emergency Contacts</span>
            <span className="emergency-badge" aria-label="Available 24 hours">24/7</span>
          </div>
          <div className="emergency-contacts" role="list">
            <button className="emergency-card" role="listitem" aria-label="Call Police at one zero zero" onClick={() => window.location.href='tel:100'}>
              <span className="icon" aria-hidden="true">👮‍♂️</span>
              <span className="label">Police</span>
              <span className="number">100</span>
            </button>
            <button className="emergency-card" role="listitem" aria-label="Call Ambulance at one zero two" onClick={() => window.location.href='tel:102'}>
              <span className="icon" aria-hidden="true">🚑</span>
              <span className="label">Ambulance</span>
              <span className="number">102</span>
            </button>
            <button className="emergency-card" role="listitem" aria-label="Call Fire Service at one zero one" onClick={() => window.location.href='tel:101'}>
              <span className="icon" aria-hidden="true">🔥</span>
              <span className="label">Fire</span>
              <span className="number">101</span>
            </button>
            <button className="emergency-card highlight" role="listitem" aria-label="Call Tourist Helpline at one three six three" onClick={() => window.location.href='tel:1363'}>
              <span className="icon" aria-hidden="true">🧭</span>
              <span className="label">Tourist Helpline</span>
              <span className="number">1363</span>
            </button>
          </div>
          <p className="emergency-note" aria-live="polite">In case of immediate danger, dial the appropriate number above.</p>
        </div>
      </div>

      {/* Footer Bottom (full-width) */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>&copy; {currentYear} Yatra360. All rights reserved. by Nagapuri Pooja</p>
          </div>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>

          <div className="back-to-top">
            <button onClick={scrollToTop} className="back-to-top-btn" aria-label="Back to top">
              <span>⬆️</span>
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
