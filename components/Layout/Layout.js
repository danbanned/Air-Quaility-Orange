// components/Layout/Layout.js
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SiteBackground from './SiteBackground';
import './Layout.css';

const Layout = ({ children, userId }) => {
  const pathname = usePathname();
  const immersiveRoutes = new Set(['/AQStories', '/simple-map']);
  const isImmersiveRoute = immersiveRoutes.has(pathname);

  return (
    <div className="layout">
      <SiteBackground />
      {!isImmersiveRoute && <Header userId={userId} />}
      <main className={`main-content ${isImmersiveRoute ? 'main-content-immersive' : ''}`}>
        <div className="main-shell">{children}</div>
      </main>
      {!isImmersiveRoute && <Footer />}
    </div>
  );
};

export default Layout;
