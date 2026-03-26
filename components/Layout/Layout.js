// components/Layout/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children, userId }) => {
  return (
    <div className="layout">
      <Header userId={userId} />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;