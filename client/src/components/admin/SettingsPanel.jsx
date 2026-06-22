import React, { useEffect, useState } from 'react';
import siteConfig from '../../config/siteConfig';
import applyOverrides from '../../config/applyOverrides';
import { fetchSettings, saveSettings } from '../../services/adminApi';

/** Immutably set a dotted path (supports array indices) on a cloned object. */
const setIn = (obj, path, value) => {
  const keys = path.split('.');
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
  cur[keys[keys.length - 1]] = value;
  return clone;
};

const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

/** Snapshot the editable slice of the (already merged) live config. */
const seedForm = () => ({
  businessName: siteConfig.businessName || '',
  businessNameShort: siteConfig.businessNameShort || '',
  tagline: siteConfig.tagline || '',
  motto: siteConfig.motto || '',

  phone: siteConfig.phone || '',
  phoneRaw: siteConfig.phoneRaw || '',
  email: siteConfig.email || '',
  whatsapp: siteConfig.whatsapp || '',
  whatsappRaw: siteConfig.whatsappRaw || '',

  social: { ...(siteConfig.social || {}) },

  locationText: siteConfig.locationText || '',
  operatingHours: siteConfig.operatingHours || '',

  trustStats: { ...(siteConfig.trustStats || {}) },

  // Per-category "Starting from" price shown on the service pages
  categoryFromPrice: Object.fromEntries(
    (siteConfig.serviceCategories || []).map((c) => [c.slug, c.fromPrice || ''])
  ),

  pricing: structuredClone(siteConfig.pricing || {}),
});

/* ── Reusable field ── */
const Field = ({ id, label, hint, value, onChange, type = 'text', placeholder, inputMode }) => (
  <div className="admin-field">
    <label className="admin-label" htmlFor={id}>{label}</label>
    <input
      id={id}
      className="admin-input"
      type={type}
      inputMode={inputMode}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
    />
    {hint && <small className="admin-hint">{hint}</small>}
  </div>
);

const SettingsPanel = () => {
  const [form, setForm] = useState(seedForm);
  const [existing, setExisting] = useState({});
  const [msg, setMsg] = useState(null); // { type, text }
  const [saving, setSaving] = useState(false);

  // Load existing overrides so a save preserves anything this form doesn't manage.
  useEffect(() => {
    fetchSettings().then((d) => setExisting(d.settings || {})).catch(() => {});
  }, []);

  const upd = (path) => (e) => setForm((f) => setIn(f, path, e.target.value));

  // Editing the display phone keeps the tel: digits in sync automatically.
  const updPhone = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, phone: v, phoneRaw: digitsOnly(v) }));
  };

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const overrides = {
        businessName: form.businessName,
        businessNameShort: form.businessNameShort,
        tagline: form.tagline,
        motto: form.motto,
        phone: form.phone,
        phoneRaw: form.phoneRaw,
        email: form.email,
        whatsapp: form.whatsapp,
        whatsappRaw: form.whatsappRaw,
        social: form.social,
        locationText: form.locationText,
        operatingHours: form.operatingHours,
        trustStats: form.trustStats,
        pricing: form.pricing,
        // Build an index-aligned array so only fromPrice changes per category.
        serviceCategories: (siteConfig.serviceCategories || []).map((c) => ({
          fromPrice: form.categoryFromPrice[c.slug] ?? c.fromPrice,
        })),
      };

      // Merge over any pre-existing overrides, then persist.
      const merged = applyOverrides(structuredClone(existing), structuredClone(overrides));
      const data = await saveSettings(merged);
      setExisting(data.settings || merged);

      // Reflect immediately on the public site within this session.
      applyOverrides(siteConfig, overrides);
      setMsg({ type: 'success', text: 'Saved. Changes are live on the website.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setForm(seedForm());
    setMsg(null);
  };

  const pricing = form.pricing || {};

  return (
    <div className="admin-card">
      <div className="admin-card__title">Site Settings</div>
      <div className="admin-card__sub">
        Edit contact details, links, key text and prices. Saved values override the site
        defaults everywhere — no redeploy needed.
      </div>

      {/* ── Brand & text ── */}
      <div className="admin-subtitle">Brand &amp; text</div>
      <div className="admin-grid">
        <Field id="s-businessName" label="Business name" value={form.businessName} onChange={upd('businessName')}
          hint="Full legal/brand name shown across the site" />
        <Field id="s-businessNameShort" label="Short name" value={form.businessNameShort} onChange={upd('businessNameShort')}
          hint='Used in buttons & badges (e.g. "Prestiva")' />
        <Field id="s-tagline" label="Tagline" value={form.tagline} onChange={upd('tagline')} />
        <Field id="s-motto" label="Motto" value={form.motto} onChange={upd('motto')} />
      </div>

      {/* ── Contact ── */}
      <div className="admin-subtitle">Contact details</div>
      <div className="admin-grid">
        <Field id="s-phone" label="Phone number" value={form.phone} onChange={updPhone}
          inputMode="tel" placeholder="0403 540 227" hint="As shown to visitors" />
        <Field id="s-phoneRaw" label="Phone (dial digits)" value={form.phoneRaw} onChange={upd('phoneRaw')}
          inputMode="numeric" hint="Auto-filled from the phone number — used for tap-to-call" />
        <Field id="s-email" label="Email" type="email" value={form.email} onChange={upd('email')}
          placeholder="admin@prestiva.com.au" />
        <Field id="s-whatsapp" label="WhatsApp (display)" value={form.whatsapp} onChange={upd('whatsapp')}
          inputMode="tel" placeholder="0403 540 227" />
        <Field id="s-whatsappRaw" label="WhatsApp (international)" value={form.whatsappRaw} onChange={upd('whatsappRaw')}
          inputMode="numeric" placeholder="61403540227" hint="Country code + number, digits only — used for wa.me links" />
      </div>

      {/* ── Social & links ── */}
      <div className="admin-subtitle">Social &amp; links</div>
      <div className="admin-grid">
        <Field id="s-facebook" label="Facebook URL" type="url" value={form.social.facebook} onChange={upd('social.facebook')}
          placeholder="https://facebook.com/…" />
        <Field id="s-instagram" label="Instagram URL" type="url" value={form.social.instagram} onChange={upd('social.instagram')}
          placeholder="https://instagram.com/…" />
        <Field id="s-tiktok" label="TikTok URL" type="url" value={form.social.tiktok} onChange={upd('social.tiktok')}
          placeholder="https://tiktok.com/@…" />
      </div>

      {/* ── Business info ── */}
      <div className="admin-subtitle">Business info</div>
      <div className="admin-grid">
        <Field id="s-locationText" label="Service area text" value={form.locationText} onChange={upd('locationText')}
          placeholder="Adelaide & Sydney" />
        <Field id="s-operatingHours" label="Operating hours" value={form.operatingHours} onChange={upd('operatingHours')}
          placeholder="7 Days a Week" />
      </div>

      {/* ── Trust stats ── */}
      <div className="admin-subtitle">Trust stats (homepage badges)</div>
      <div className="admin-grid">
        <Field id="s-ts-props" label="Properties serviced" value={form.trustStats.propertiesServiced} onChange={upd('trustStats.propertiesServiced')} placeholder="500+" />
        <Field id="s-ts-rating" label="Google rating" value={form.trustStats.googleRating} onChange={upd('trustStats.googleRating')} placeholder="5-Star" />
        <Field id="s-ts-ins" label="Insurance" value={form.trustStats.insurance} onChange={upd('trustStats.insurance')} placeholder="Fully Insured" />
        <Field id="s-ts-avail" label="Availability" value={form.trustStats.availability} onChange={upd('trustStats.availability')} placeholder="7 Days" />
      </div>

      {/* ── Service-page starting prices ── */}
      {siteConfig.serviceCategories?.length > 0 && (
        <>
          <div className="admin-subtitle">Service page “starting from” prices</div>
          <div className="admin-grid">
            {siteConfig.serviceCategories.map((c) => (
              <Field
                key={c.slug}
                id={`s-cat-${c.slug}`}
                label={c.title}
                value={form.categoryFromPrice[c.slug]}
                onChange={upd(`categoryFromPrice.${c.slug}`)}
                placeholder="$65"
                hint="Shown as “Starting from …” on the service page"
              />
            ))}
          </div>
        </>
      )}

      {/* ── Residential pricing ── */}
      {Array.isArray(pricing.residential) && (
        <>
          <div className="admin-subtitle">Residential pricing</div>
          <div className="admin-grid">
            {pricing.residential.map((row, i) => (
              <Field
                key={i}
                id={`s-res-${i}`}
                label={row.bed}
                value={row.price}
                onChange={upd(`pricing.residential.${i}.price`)}
                placeholder="$120"
              />
            ))}
          </div>
        </>
      )}

      {/* ── Commercial pricing (price + unit) ── */}
      {pricing.commercial && (
        <>
          <div className="admin-subtitle">Commercial pricing</div>
          {Object.entries(pricing.commercial).map(([key, val]) => (
            <div className="admin-grid" key={key}>
              <Field id={`s-com-${key}-price`} label={`${val.label || key} — price`}
                value={val.price} onChange={upd(`pricing.commercial.${key}.price`)} placeholder="$35" />
              <Field id={`s-com-${key}-unit`} label={`${val.label || key} — unit`}
                value={val.unit} onChange={upd(`pricing.commercial.${key}.unit`)} placeholder="/hour" hint="Leave blank for none" />
            </div>
          ))}
        </>
      )}

      {/* ── Landscaping pricing ── */}
      {pricing.landscaping && (
        <>
          <div className="admin-subtitle">Landscaping pricing</div>
          <div className="admin-grid">
            {Object.entries(pricing.landscaping).map(([key, val]) => (
              <Field
                key={key}
                id={`s-lnd-${key}`}
                label={val.label || key}
                value={val.price}
                onChange={upd(`pricing.landscaping.${key}.price`)}
                placeholder="$60"
              />
            ))}
          </div>
        </>
      )}

      {msg && <div className={`admin-alert admin-alert--${msg.type}`}>{msg.text}</div>}

      <div className="admin-savebar">
        <button className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="admin-btn admin-btn--ghost" onClick={onReset} disabled={saving}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
