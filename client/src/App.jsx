import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/utils/ScrollToTop';
import PageLoader from './components/utils/PageLoader';

// Home loads eagerly (it's the most common landing page); the rest are
// code-split so heavy deps (Leaflet on Contact, etc.) don't bloat the
// initial bundle.
import HomePage from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const CommercialPage = lazy(() => import('./pages/CommercialPage'));
const ResidentialPage = lazy(() => import('./pages/ResidentialPage'));
const LandscapingPage = lazy(() => import('./pages/LandscapingPage'));
const ServiceCategoryPage = lazy(() => import('./pages/ServiceCategoryPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin (separate from the public site — no shared header/footer)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const RequireAdmin = lazy(() => import('./components/admin/RequireAdmin'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin area */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* Public site (wrapped in the shared Layout) */}
          <Route element={<Layout />}>
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
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
