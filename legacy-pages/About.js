'use client';

// pages/ebony.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Ebony.module.css';
import useRouteInfo from '../utils/useRouteInfo';

const Ebony = () => {
  const { userId } = useRouteInfo();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const projects = [
    {
      id: 'pgp-presents',
      title: 'PGP Presents',
      year: '2014 - Present',
      description: 'A collection of short films and series highlighting Black stories in Philadelphia. From intimate portraits of community leaders to vibrant celebrations of Black culture, PGP Presents has been the heartbeat of Pearl\'s Girl Productions for over a decade.',
      achievements: ['20+ films produced', 'Screened at 15 festivals', 'Featured on Black Public Media'],
      image: '/images/ebony/pgp-presents.jpg',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'film'
    },
    {
      id: 'air-quality-orange',
      title: 'Air Quality Orange',
      year: '2023 - Present',
      description: 'A groundbreaking documentary and interactive experience exploring environmental justice in Nicetown, Hunting Park, and Eastwick. This project combines traditional storytelling with community engagement, putting residents\' voices at the center of the environmental justice movement.',
      achievements: ['Community screenings in 5 neighborhoods', 'Featured in Environmental Justice Summit', 'Interactive map with 10k+ users'],
      image: '/images/ebony/air-quality-orange.jpg',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'documentary'
    },
    {
      id: 'mobile-studio',
      title: 'Mobile Studio Initiative',
      year: '2021 - Present',
      description: 'Bringing filmmaking tools and training directly to Philadelphia communities. The Mobile Studio empowers residents to tell their own stories, providing equipment, workshops, and mentorship to emerging filmmakers in underserved neighborhoods.',
      achievements: ['Trained 150+ community members', 'Mobile studio visits to 12 neighborhoods', 'Youth filmmaker showcase annually'],
      image: '/images/ebony/mobile-studio.jpg',
      category: 'community'
    },
    {
      id: 'art-basel',
      title: 'Art Basel Showcase',
      year: '2022',
      description: 'Ebony\'s work was featured at Art Basel, bringing Philadelphia\'s Black stories to an international stage. The showcase highlighted the intersection of art, activism, and community storytelling.',
      achievements: ['Featured artist', 'Panel discussion on community cinema', 'Networking with international curators'],
      image: '/images/ebony/art-basel.jpg',
      category: 'exhibition'
    }
  ];

  const milestones = [
    { year: '2014', title: 'Founded Pearl\'s Girl Productions', description: 'Started with a mission to tell authentic Black stories' },
    { year: '2016', title: 'First Festival Selection', description: 'PGP Presents screened at BlackStar Film Festival' },
    { year: '2018', title: 'Community Partnerships', description: 'Began collaborations with HPSCI and Furtick Farms' },
    { year: '2020', title: 'Puffin Foundation Grant', description: 'Received funding for environmental justice storytelling' },
    { year: '2022', title: 'Art Basel Debut', description: 'International recognition for community-centered work' },
    { year: '2024', title: 'Air Quality Orange Launch', description: 'Interactive doc reaches 10,000+ users' }
  ];

  const values = [
    {
      title: 'Community First',
      description: 'Stories are most powerful when they come from the people who live them. I center community voices in everything I create.',
      icon: '🤝'
    },
    {
      title: 'Creative Courage',
      description: 'Telling true stories requires bravery—to confront injustice, to celebrate joy, and to show our full humanity.',
      icon: '🦁'
    },
    {
      title: 'Relentless Responsibility',
      description: 'As a storyteller, I have a responsibility to honor the trust placed in me by my community and subjects.',
      icon: '⭐'
    },
    {
      title: 'Joy as Resistance',
      description: 'Our stories aren\'t just about struggle—they\'re about joy, celebration, and the beauty of Black life.',
      icon: '✨'
    }
  ];

  return (
    <>
      <Head>
        <title>Ebony | Filmmaker & Storyteller - Pearl's Girl Productions</title>
        <meta name="description" content="Ebony is a Philadelphia-based filmmaker and founder of Pearl's Girl Productions, telling Black stories through documentary, film, and community engagement." />
        <meta property="og:title" content="Ebony | Filmmaker & Storyteller" />
        <meta property="og:description" content="Bringing Black stories to light in Philadelphia and beyond." />
        <meta property="og:image" content="/images/ebony/og-image.jpg" />
      </Head>

      <div className={styles.ebonyPage}>
        {/* Hero Section */}
        <section className={styles.hero} id="hero">
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroName}>Ebony</h1>
              <p className={styles.heroTitle}>Filmmaker • Storyteller • Community Advocate</p>
              <div className={styles.heroLine}></div>
              <p className={styles.heroMission}>
                "Bringing Black Stories to Light in Philadelphia and Beyond"
              </p>
              <div className={styles.heroButtons}>
                <a href="#contact" className="btn">Connect with Me</a>
                <a href="#projects" className="btn btn-secondary">View My Work</a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.imagePlaceholder}>
                <span>📸</span>
                <p>Ebony Portrait</p>
              </div>
            </div>
          </div>
          <div className={styles.scrollIndicator}>
            <span>Scroll to explore</span>
            <div className={styles.scrollArrow}>↓</div>
          </div>
        </section>

        {/* Story Section */}
        <section 
          id="story" 
          ref={(el) => (sectionRefs.current.story = el)}
          className={`${styles.section} ${isVisible.story ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Story</h2>
              <div className={styles.sectionLine}></div>
            </div>
            
            <div className={styles.storyGrid}>
              <div className={styles.storyContent}>
                <p className={styles.storyIntro}>
                  I'm a filmmaker from Philadelphia, born and raised in the neighborhoods that shape my work.
                </p>
                <p>
                  Growing up in North Philly, I learned that our stories matter—even when mainstream media looks away. 
                  I started Pearl's Girl Productions in 2014 with a simple belief: that Black stories deserve to be told 
                  with honesty, complexity, and love.
                </p>
                <p>
                  Over the past decade, I've built a creative community that spans from Hunting Park to Art Basel. 
                  My work merges filmmaking with activism, using documentary, narrative, and interactive media to shine 
                  light on environmental justice, community resilience, and the everyday beauty of Black life.
                </p>
                <p>
                  I believe that storytelling is a tool for change. When we see ourselves reflected authentically on screen, 
                  we imagine new possibilities. When we document our struggles and victories, we build a record that future 
                  generations can learn from.
                </p>
                <p className={styles.storyQuote}>
                  "I make films because our stories are powerful. They can heal, inspire, and move people to action."
                </p>
              </div>
              <div className={styles.storyImage}>
                <div className={styles.imagePlaceholderLarge}>
                  <span>🎬</span>
                  <p>Ebony on set</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section - Accomplishments */}
        <section 
          id="accomplishments" 
          ref={(el) => (sectionRefs.current.accomplishments = el)}
          className={`${styles.section} ${styles.timelineSection} ${isVisible.accomplishments ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Journey</h2>
              <div className={styles.sectionLine}></div>
              <p className={styles.sectionSubtitle}>Key milestones in storytelling and community building</p>
            </div>

            <div className={styles.timeline}>
              {milestones.map((milestone, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineYear}>{milestone.year}</div>
                  <div className={styles.timelineContent}>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Years of Storytelling</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>20+</span>
                <span className={styles.statLabel}>Films Produced</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>150+</span>
                <span className={styles.statLabel}>Community Members Trained</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>15+</span>
                <span className={styles.statLabel}>Festival Screenings</span>
              </div>
            </div>
          </div>
        </section>

        {/* Values & Morals Section */}
        <section 
          id="values" 
          ref={(el) => (sectionRefs.current.values = el)}
          className={`${styles.section} ${styles.valuesSection} ${isVisible.values ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>What I Stand For</h2>
              <div className={styles.sectionLine}></div>
              <p className={styles.sectionSubtitle}>The principles that guide my work and life</p>
            </div>

            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.personalQuote}>
              <blockquote>
                "I didn't choose filmmaking—it chose me. As a young girl in North Philly, I knew I had stories to tell. 
                Now, I'm committed to creating space for others to tell theirs."
              </blockquote>
              <cite>— Ebony, Founder of Pearl's Girl Productions</cite>
            </div>
          </div>
        </section>

        {/* Goals & Vision Section */}
        <section 
          id="vision" 
          ref={(el) => (sectionRefs.current.vision = el)}
          className={`${styles.section} ${styles.visionSection} ${isVisible.vision ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Vision</h2>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.visionGrid}>
              <div className={styles.visionCard}>
                <span className={styles.visionIcon}>🌱</span>
                <h3>A Greener Philadelphia</h3>
                <p>Continuing the fight for environmental justice through documentary and community organizing. Our neighborhoods deserve clean air and green spaces.</p>
              </div>
              <div className={styles.visionCard}>
                <span className={styles.visionIcon}>🎬</span>
                <h3>More Black Stories</h3>
                <p>Expanding PGP's reach to support more Black filmmakers and tell more stories that center our experiences—in all their complexity and joy.</p>
              </div>
              <div className={styles.visionCard}>
                <span className={styles.visionIcon}>📱</span>
                <h3>Accessible Media</h3>
                <p>Building tools and platforms that make filmmaking accessible to everyone, especially those who've been excluded from traditional media spaces.</p>
              </div>
              <div className={styles.visionCard}>
                <span className={styles.visionIcon}>🤝</span>
                <h3>Creative Community</h3>
                <p>Growing a network of artists, activists, and storytellers who support each other and create change together.</p>
              </div>
            </div>

            <div className={styles.commitmentBox}>
              <h3>My Commitment</h3>
              <p>
                I'm committed to using my platform and skills to uplift my community, fight for justice, 
                and create space for stories that deserve to be told. The next chapter of my work will focus 
                on expanding access to media production in Philadelphia and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section 
          id="projects" 
          ref={(el) => (sectionRefs.current.projects = el)}
          className={`${styles.section} ${styles.projectsSection} ${isVisible.projects ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Work</h2>
              <div className={styles.sectionLine}></div>
              <p className={styles.sectionSubtitle}>Projects that have shaped my journey</p>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={styles.projectCard}
                  onClick={() => setActiveProject(project)}
                >
                  <div className={styles.projectImage}>
                    <div className={styles.imagePlaceholder}>
                      <span>{project.category === 'film' ? '🎬' : project.category === 'documentary' ? '📽️' : '🤝'}</span>
                    </div>
                    <div className={styles.projectOverlay}>
                      <span>Click to learn more</span>
                    </div>
                  </div>
                  <div className={styles.projectInfo}>
                    <h3>{project.title}</h3>
                    <p className={styles.projectYear}>{project.year}</p>
                    <p className={styles.projectDesc}>{project.description.substring(0, 100)}...</p>
                    <div className={styles.projectTags}>
                      {project.achievements.slice(0, 2).map((achievement, i) => (
                        <span key={i} className={styles.projectTag}>{achievement}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Modal */}
        {activeProject && (
          <div className={styles.modal} onClick={() => setActiveProject(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setActiveProject(null)}>✕</button>
              <h2>{activeProject.title}</h2>
              <p className={styles.modalYear}>{activeProject.year}</p>
              <div className={styles.modalVideo}>
                {activeProject.video ? (
                  <iframe
                    src={activeProject.video}
                    title={activeProject.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span>🎥</span>
                    <p>Trailer coming soon</p>
                  </div>
                )}
              </div>
              <p className={styles.modalDescription}>{activeProject.description}</p>
              <div className={styles.modalAchievements}>
                <h3>Key Achievements</h3>
                <ul>
                  {activeProject.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <section 
          id="contact" 
          ref={(el) => (sectionRefs.current.contact = el)}
          className={`${styles.section} ${styles.contactSection} ${isVisible.contact ? styles.visible : ''}`}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Let's Connect</h2>
              <div className={styles.sectionLine}></div>
              <p className={styles.sectionSubtitle}>I'm always looking for new collaborators, stories, and opportunities</p>
            </div>

            <div className={styles.contactGrid}>
              <div className={styles.contactInfo}>
                <h3>Let's Create Together</h3>
                <p>
                  Whether you're interested in collaborating on a film, bringing the Mobile Studio to your community, 
                  or just want to chat about storytelling—I'd love to hear from you.
                </p>
                
                <div className={styles.socialLinks}>
                  <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>📘 Instagram</a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>🐦 Twitter</a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>🎬 Vimeo</a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>💼 LinkedIn</a>
                </div>
                
                <div className={styles.contactDirect}>
                  <p><strong>📧 Email:</strong> ebony@pearlsgirlproductions.com</p>
                  <p><strong>📍 Location:</strong> Philadelphia, PA</p>
                </div>
              </div>

              <div className={styles.contactForm}>
                {formSubmitted ? (
                  <div className={styles.successMessage}>
                    <h3>Thank You!</h3>
                    <p>Your message has been sent. I'll get back to you within 2-3 business days.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label>Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Message *</label>
                      <textarea
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn">Send Message</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerContent}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoIcon}>🎬</span>
                <span className={styles.footerLogoText}>Pearl's Girl Productions</span>
              </div>
              <p className={styles.footerCopyright}>
                &copy; 2024 Ebony | Pearl's Girl Productions. All rights reserved.
              </p>
              <div className={styles.footerLinks}>
                <Link href="/">Home</Link>
                <Link href="/contact">Contact</Link>
                <a href="#hero">Back to Top</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Ebony;
