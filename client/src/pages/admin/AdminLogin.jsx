import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isLoggedIn } from '../../services/adminApi';
import '../../styles/admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [token, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isLoggedIn()) {
    navigate('/admin', { replace: true });
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(token.trim());
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <h1 className="admin-login__title">Prestiva Admin</h1>
        <p className="admin-login__sub">Enter your access token to continue.</p>

        <label htmlFor="admin-token" className="admin-label">Access token</label>
        <input
          id="admin-token"
          type="password"
          className="admin-input"
          value={token}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="••••••••••••"
          autoFocus
          autoComplete="current-password"
        />

        {error && <div className="admin-alert admin-alert--error">{error}</div>}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || !token.trim()}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
