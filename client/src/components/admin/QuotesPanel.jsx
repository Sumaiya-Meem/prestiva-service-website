import React, { useEffect, useMemo, useState } from 'react';
import { fetchQuotes, updateQuoteStatus, updateQuote } from '../../services/adminApi';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const QuotesPanel = () => {
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({}); // id -> draft text
  const [savingNoteId, setSavingNoteId] = useState(null);

  const load = async (status = filter) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchQuotes(status);
      setQuotes(data.quotes || []);
    } catch (err) {
      setError(err.message);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); /* initial */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFilter = (status) => {
    setFilter(status);
    load(status);
  };

  const onStatusChange = async (id, status) => {
    setSavingId(id);
    try {
      await updateQuoteStatus(id, status);
      setQuotes((prev) => prev.map((q) => (q._id === id ? { ...q, status } : q)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleOpen = (q) => {
    const opening = openId !== q._id;
    setOpenId(opening ? q._id : null);
    if (opening) setNoteDrafts((d) => ({ ...d, [q._id]: q.internalNotes || '' }));
  };

  const onSaveNote = async (id) => {
    setSavingNoteId(id);
    try {
      await updateQuote(id, { internalNotes: noteDrafts[id] ?? '' });
      setQuotes((prev) => prev.map((q) => (q._id === id ? { ...q, internalNotes: noteDrafts[id] ?? '' } : q)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNoteId(null);
    }
  };

  const onToggleArchive = async (q) => {
    try {
      await updateQuote(q._id, { archived: !q.archived });
      setQuotes((prev) => prev.map((x) => (x._id === q._id ? { ...x, archived: !q.archived } : x)));
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = useMemo(() => {
    const c = { total: quotes.length };
    STATUSES.forEach((s) => { c[s] = quotes.filter((q) => q.status === s).length; });
    return c;
  }, [quotes]);

  return (
    <div className="admin-card">
      <div className="admin-card__title">Quote Requests</div>
      <div className="admin-card__sub">Leads submitted through the website contact form.</div>

      {/* Stats (reflect the current filter result) */}
      <div className="admin-stats">
        <div className="admin-stat"><div className="admin-stat__num">{counts.total}</div><div className="admin-stat__label">Showing</div></div>
        <div className="admin-stat"><div className="admin-stat__num">{counts.new}</div><div className="admin-stat__label">New</div></div>
        <div className="admin-stat"><div className="admin-stat__num">{counts.contacted}</div><div className="admin-stat__label">Contacted</div></div>
        <div className="admin-stat"><div className="admin-stat__num">{counts.won}</div><div className="admin-stat__label">Won</div></div>
      </div>

      <div className="admin-toolbar">
        <select className="admin-select" value={filter} onChange={(e) => onFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button className="admin-btn admin-btn--sm" onClick={() => load(filter)} disabled={loading}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
        <div className="admin-toolbar__spacer" />
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {!error && !loading && quotes.length === 0 && (
        <div className="admin-empty">No quote requests yet.</div>
      )}

      {quotes.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Service</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <React.Fragment key={q._id}>
                  <tr className={openId === q._id ? 'is-open' : ''}>
                    <td>{fmtDate(q.createdAt)}</td>
                    <td><strong>{q.fullName}</strong></td>
                    <td>{q.service}</td>
                    <td>
                      <a href={`tel:${q.phone}`}>{q.phone}</a><br />
                      <a href={`mailto:${q.email}`}>{q.email}</a>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        value={q.status}
                        disabled={savingId === q._id}
                        onChange={(e) => onStatusChange(q._id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--sm admin-btn--ghost admin-table__expand"
                        onClick={() => toggleOpen(q)}
                      >
                        {openId === q._id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {openId === q._id && (
                    <tr>
                      <td className="admin-detail" colSpan={6}>
                        <div><strong>Location:</strong> {q.suburb || '—'}
                          {q.mapLat && q.mapLng && (
                            <> &nbsp;·&nbsp; <a href={`https://www.google.com/maps?q=${q.mapLat},${q.mapLng}`} target="_blank" rel="noopener noreferrer">📍 Map</a></>
                          )}
                        </div>
                        {q.propertyType && <div><strong>Property type:</strong> {q.propertyType}</div>}
                        {q.preferredDate && <div><strong>Preferred date:</strong> {q.preferredDate}</div>}
                        {q.photos?.length > 0 && <div><strong>Photos:</strong> {q.photos.length} (sent via email)</div>}
                        <div style={{ marginTop: 8 }}>
                          <strong>Message:</strong>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{q.message || '— none —'}</div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <strong>Internal notes</strong> <span style={{ color: 'var(--adm-muted)', fontWeight: 400 }}>(private)</span>
                          <textarea
                            className="admin-input"
                            style={{ width: '100%', marginTop: 6, minHeight: 64, resize: 'vertical' }}
                            placeholder="Add a private note about this lead…"
                            value={noteDrafts[q._id] ?? ''}
                            onChange={(e) => setNoteDrafts((d) => ({ ...d, [q._id]: e.target.value }))}
                          />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button
                              className="admin-btn admin-btn--sm admin-btn--primary"
                              onClick={() => onSaveNote(q._id)}
                              disabled={savingNoteId === q._id || (noteDrafts[q._id] ?? '') === (q.internalNotes || '')}
                            >
                              {savingNoteId === q._id ? 'Saving…' : 'Save note'}
                            </button>
                            <button className="admin-btn admin-btn--sm" onClick={() => onToggleArchive(q)}>
                              {q.archived ? 'Unarchive' : 'Archive'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotesPanel;
