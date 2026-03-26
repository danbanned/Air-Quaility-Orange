// components/Layout/Footer.js
import React from 'react';
import Link from 'next/link';
import './Footer.css'; // Add this line


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        <div className="footer-section">
          <h3>Air Quality Orange</h3>
          <p>
            Empowering communities through environmental justice and action in
            Nicetown, Hunting Park, and Eastwick, Philadelphia.
          </p>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">📘</a>
            <a href="#" target="_blank" rel="noopener noreferrer">🐦</a>
            <a href="#" target="_blank" rel="noopener noreferrer">📷</a>
            <a href="#" target="_blank" rel="noopener noreferrer">💬</a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/problem">The Problem</Link></li>
            <li><Link href="/history">The History</Link></li>
            <li><Link href="/map">The Map</Link></li>
            <li><Link href="/voices">Community Voices</Link></li>
            <li><Link href="/get-involved">Get Involved</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li>📞 (215) 555-0123</li>
            <li>📧 info@airqualityorange.org</li>
            <li>📍 4500 N Front St, Philadelphia, PA 19140</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Join Our Network</h3>
          <p>Stay updated on events and actions</p>
          <input
            type="email"
            placeholder="Your email"
            style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          />
          <button className="btn">Subscribe</button>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          &copy; 2024 Air Quality Orange. All rights reserved. Built for environmental justice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
