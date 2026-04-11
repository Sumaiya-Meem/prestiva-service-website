import React from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import { FaPhoneAlt } from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';
import ScrollToTopButton from '../utils/ScrollToTopButton';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <AnnouncementBar />
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />

      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
