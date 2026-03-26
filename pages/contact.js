// pages/contact.js - CORRECTED
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Contact.module.css';

const Contact = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="container">  {/* Just start with the container div */}
      <div className={styles.header}>
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">
          Get in touch with the Air Quality Orange team
        </p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <h2>Connect With Us</h2>
          
          <div className={styles.infoCard}>
            <h3>📍 Visit Us</h3>
            <p>Nicetown Community Development Corporation</p>
            <p>4300 Germantown Avenue</p>
            <p>Philadelphia, PA 19140</p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>📞 Call Us</h3>
            <p>Main: (215) 555-0123</p>
            <p>Volunteer Hotline: (215) 555-0124</p>
            <p>Media Inquiries: (215) 555-0125</p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>📧 Email Us</h3>
            <p>General: info@airqualityorange.org</p>
            <p>Volunteer: volunteer@airqualityorange.org</p>
            <p>Media: press@airqualityorange.org</p>
          </div>
          
          <div className={styles.socialSection}>
            <h3>Follow Us</h3>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>📘 Facebook</a>
              <a href="#" className={styles.socialLink}>🐦 Twitter</a>
              <a href="#" className={styles.socialLink}>📷 Instagram</a>
              <a href="#" className={styles.socialLink}>💬 Discord</a>
              <a href="#" className={styles.socialLink}>📺 YouTube</a>
            </div>
          </div>
          
          <div className={styles.officeHours}>
            <h3>Office Hours</h3>
            <p>Monday - Friday: 9am - 5pm</p>
            <p>Saturday: 10am - 2pm (by appointment)</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
        
        <div className={styles.contactForm}>
          <h2>Send Us a Message</h2>
          
          {formSubmitted ? (
            <div className={styles.successMessage}>
              <h3>Thank You!</h3>
              <p>Your message has been sent. We'll get back to you within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name *</label>
                  <input type="text" required />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Last Name *</label>
                  <input type="text" required />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input type="email" required />
              </div>
              
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input type="tel" />
              </div>
              
              <div className={styles.formGroup}>
                <label>Subject *</label>
                <select required>
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="volunteer">Volunteer Opportunities</option>
                  <option value="event">Event Information</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="media">Media Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea rows="6" required></textarea>
              </div>
              
              <div className={styles.formCheckbox}>
                <input type="checkbox" id="newsletter" />
                <label htmlFor="newsletter">Subscribe to our newsletter</label>
              </div>
              
              <button type="submit" className="btn">Send Message</button>
            </form>
          )}
        </div>
      </div>

      <div className={styles.mapSection}>
        <h2>Find Us</h2>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapContent}>
            <span>🗺️</span>
            <p>Interactive Map</p>
            <p className={styles.mapAddress}>4300 Germantown Avenue, Philadelphia, PA 19140</p>
            <button className="btn-secondary" onClick={() => window.open('https://maps.google.com')}>
              Open in Google Maps
            </button>
          </div>
        </div>
      </div>

      <div className={styles.teamSection}>
        <h2>Our Team</h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <div className={styles.memberImage}></div>
            <h3>Maria Rodriguez</h3>
            <p>Executive Director</p>
            <p className={styles.memberContact}>maria@airqualityorange.org</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberImage}></div>
            <h3>James Washington</h3>
            <p>Community Organizer</p>
            <p className={styles.memberContact}>james@airqualityorange.org</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberImage}></div>
            <h3>Keisha Brown</h3>
            <p>Youth Program Coordinator</p>
            <p className={styles.memberContact}>keisha@airqualityorange.org</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberImage}></div>
            <h3>Carlos Mendez</h3>
            <p>Health Advocate</p>
            <p className={styles.memberContact}>carlos@airqualityorange.org</p>
          </div>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3>How can I get involved?</h3>
            <p>Visit our Get Involved page to see volunteer opportunities, events, and ways to support our work.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>Do you accept donations?</h3>
            <p>Yes! Donations support our programs, tree planting, and community gardens. All donations are tax-deductible.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>How do I report an environmental issue?</h3>
            <p>Contact us directly or use our online reporting tool. We'll help connect you with the right resources.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>Can my organization partner with you?</h3>
            <p>Yes! We welcome partnerships with schools, businesses, and community organizations. Email us to discuss.</p>
          </div>
        </div>
      </div>

      {userId && (
        <div className={styles.userContext}>
          <p>Welcome back! Your contact preferences are saved.</p>
        </div>
      )}
    </div> 
    
  );
};


export default Contact;