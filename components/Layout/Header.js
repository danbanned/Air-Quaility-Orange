// components/Layout/Header.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import './Header.css';

const Header = ({ userId }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);
  const router = useRouter();

  // Define isActive function
  const isActive = (path) => {
    return router.pathname === path;
  };

  // Group nav items into dropdowns for better organization
  const navGroups = [
    {
      title: 'Learn',
      icon: '📚',
      items: [
        { path: '/problem', label: 'The Problem', description: 'Understanding our challenges' },
        { path: '/history', label: 'The History', description: 'Redlining & disinvestment' },
        { path: '/data', label: 'The Data', description: 'Numbers behind injustice' },
        { path: '/About', label: 'The About', description: 'Learn more about us' }
      ]
    },
    {
      title: 'Explore',
      icon: '🗺️',
      items: [
        { path: '/map', label: 'The Map', description: 'Interactive EJ map' },
        { path: '/voices', label: 'Community Voices', description: 'Stories from neighbors' },
        { path: '/solutions', label: 'Solutions', description: 'Grassroots action' }
      ]
    },
    {
      title: 'Act',
      icon: '🤝',
      items: [
        { path: '/events', label: 'Events', description: 'Join us in person' },
        { path: '/get-involved', label: 'Get Involved', description: 'Volunteer & donate' },
        { path: '/contact', label: 'Contact', description: 'Reach out to us' }
      ]
    }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Update progress bar
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progressBar = document.querySelector('.header-progress');
      if (progressBar) {
        progressBar.style.width = scrolled + '%';
      }

      // Update header style
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [router.pathname]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}${userId ? `&userId=${userId}` : ''}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header 
      ref={headerRef}
      className={`header ${scrolled ? 'header-scrolled' : ''} ${menuOpen ? 'header-mobile-open' : ''}`}
    >
      {/* Progress Bar */}
      <div className="header-progress"></div>

      <div className="header-content">
        {/* Logo Section with Enhanced Design */}
        <div className="logo-section">
          <Link href={`/?userId=${userId || ''}`} className="logo-link">
            <div className="logo-icon">
              <span className="logo-icon-main">🌍</span>
              <span className="logo-icon-glow"></span>
            </div>
            <div className="logo-text">
              <span className="logo-main">Air Quality Orange</span>
              <span className="logo-sub">Nicetown • Hunting Park • Eastwick</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navGroups.map((group, index) => (
            <div 
              key={group.title} 
              className={`nav-dropdown ${activeDropdown === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveDropdown(index)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="nav-dropdown-trigger">
                <span className="nav-icon">{group.icon}</span>
                <span className="nav-label">{group.title}</span>
                <span className="nav-arrow">▼</span>
              </button>
              
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <span className="dropdown-header-icon">{group.icon}</span>
                  <span className="dropdown-header-title">{group.title}</span>
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    href={`${item.path}${userId ? `?userId=${userId}` : ''}`}
                    className={`dropdown-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <span className="dropdown-item-label">{item.label}</span>
                    <span className="dropdown-item-desc">{item.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Single nav items */}
          <Link
            href={`/${userId ? `?userId=${userId}` : ''}`}
            className={`nav-single ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Search Button */}
          <div className={`search-container ${searchOpen ? 'active' : ''}`}>
            {searchOpen ? (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-input"
                />
                <button type="submit" className="search-submit">🔍</button>
                <button 
                  type="button" 
                  className="search-close"
                  onClick={() => setSearchOpen(false)}
                >
                  ✕
                </button>
              </form>
            ) : (
              <button 
                className="action-button search-button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                🔍
              </button>
            )}
          </div>

          {/* User Menu */}
          {userId ? (
            <div className="user-menu">
              <button className="user-menu-trigger">
                <span className="user-avatar">
                  {userId.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{userId}</span>
                <span className="user-arrow">▼</span>
              </button>
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <span className="user-dropdown-avatar">
                    {userId.charAt(0).toUpperCase()}
                  </span>
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{userId}</span>
                    <span className="user-dropdown-email">{userId}@example.com</span>
                  </div>
                </div>
                <div className="user-dropdown-menu">
                  <Link href={`/profile?userId=${userId}`} className="user-dropdown-item">
                    <span className="user-dropdown-icon">👤</span>
                    My Profile
                  </Link>
                  <Link href={`/saved?userId=${userId}`} className="user-dropdown-item">
                    <span className="user-dropdown-icon">🔖</span>
                    Saved Items
                  </Link>
                  <Link href={`/activities?userId=${userId}`} className="user-dropdown-item">
                    <span className="user-dropdown-icon">📋</span>
                    My Activities
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <Link href="/" className="user-dropdown-item logout">
                    <span className="user-dropdown-icon">🚪</span>
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="auth-button login">
                Log In
              </Link>
              <Link href="/signup" className="auth-button signup">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
          <div className="nav-mobile-header">
            <span className="nav-mobile-title">Menu</span>
            <button 
              className="nav-mobile-close"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="nav-mobile-content">
            {/* Mobile Search */}
            <div className="nav-mobile-search">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">🔍</button>
              </form>
            </div>

            {/* Mobile Navigation Items */}
            {navGroups.map((group) => (
              <div key={group.title} className="nav-mobile-group">
                <div className="nav-mobile-group-header">
                  <span className="nav-mobile-group-icon">{group.icon}</span>
                  <span className="nav-mobile-group-title">{group.title}</span>
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    href={`${item.path}${userId ? `?userId=${userId}` : ''}`}
                    className={`nav-mobile-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="nav-mobile-item-label">{item.label}</span>
                    <span className="nav-mobile-item-desc">{item.description}</span>
                  </Link>
                ))}
              </div>
            ))}

            {/* Mobile Single Items */}
            <Link
              href={`/${userId ? `?userId=${userId}` : ''}`}
              className={`nav-mobile-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-mobile-item-label">Home</span>
            </Link>

            {/* Mobile Auth */}
            {!userId && (
              <div className="nav-mobile-auth">
                <Link href="/login" className="nav-mobile-auth-button login">
                  Log In
                </Link>
                <Link href="/signup" className="nav-mobile-auth-button signup">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
};

export default Header;