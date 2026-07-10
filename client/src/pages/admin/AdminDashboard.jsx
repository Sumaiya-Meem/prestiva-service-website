import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../../services/adminApi';
import QuotesPanel from '../../components/admin/QuotesPanel';
import SettingsPanel from '../../components/admin/SettingsPanel';
import GalleryPanel from '../../components/admin/GalleryPanel';
import BackgroundsPanel from '../../components/admin/BackgroundsPanel';
import SeoPanel from '../../components/admin/SeoPanel';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('quotes');

  const logout = () => {
    clearToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="admin-topbar__brand">Prestiva <span>Admin</span></div>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'quotes' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('quotes')}
          >
            Quote Requests
          </button>
          <button
            className={`admin-tab ${tab === 'gallery' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            Gallery
          </button>
          <button
            className={`admin-tab ${tab === 'backgrounds' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('backgrounds')}
          >
            Page Backgrounds
          </button>
          <button
            className={`admin-tab ${tab === 'seo' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('seo')}
          >
            SEO
          </button>
          <button
            className={`admin-tab ${tab === 'settings' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('settings')}
          >
            Site Settings
          </button>
        </div>
        <button className="admin-btn admin-btn--sm" onClick={logout}>Log out</button>
      </div>

      <div className="admin-main">
        {tab === 'quotes' && <QuotesPanel />}
        {tab === 'gallery' && <GalleryPanel />}
        {tab === 'backgrounds' && <BackgroundsPanel />}
        {tab === 'seo' && <SeoPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;
