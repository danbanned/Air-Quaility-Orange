// components/Layout/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SiteBackground from './SiteBackground';
import './Layout.css';

const Layout = ({ children, userId }) => {
  return (
    <div className="layout">
      <SiteBackground />
      <Header userId={userId} />
      <main className="main-content">
        <div className="main-shell">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
