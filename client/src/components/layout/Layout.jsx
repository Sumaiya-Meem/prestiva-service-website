import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
// import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import MobileContactBar from './MobileContactBar';
import FloatingActions from './FloatingActions';
import ScrollToTopButton from '../utils/ScrollToTopButton';
import RevealManager from '../utils/RevealManager';

const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="app-layout">
      <RevealManager />
      <a href="#main" className="skip-link">Skip to content</a>
      {/* <AnnouncementBar /> */}
      <Header />
      <main id="main" className="main-content">
        <div key={location.pathname} className="page-transition">
          {children || <Outlet />}
        </div>
      </main>
      <Footer />

      <FloatingActions />
      <ScrollToTopButton />
      <MobileContactBar />
    </div>
  );
};

export default Layout;
