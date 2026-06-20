import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CommercialPage from './pages/CommercialPage';
import ResidentialPage from './pages/ResidentialPage';
import LandscapingPage from './pages/LandscapingPage';
import ServiceCategoryPage from './pages/ServiceCategoryPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/commercial" element={<CommercialPage />} />
          <Route path="/residential" element={<ResidentialPage />} />
          <Route path="/landscaping" element={<LandscapingPage />} />
          <Route path="/cleaning" element={<ServiceCategoryPage slug="cleaning" />} />
          <Route path="/property-maintenance" element={<ServiceCategoryPage slug="property-maintenance" />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
