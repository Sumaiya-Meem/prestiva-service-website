import React, { useEffect, useRef } from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

/**
 * A tiny contentEditable rich-text field with Bold / Italic / Link buttons.
 * Emits allow-listed HTML (formatting forced to tags, not inline styles, so the
 * sanitizer keeps it). Seed once on mount — give it a stable `key` per field so
 * switching field/group remounts and re-seeds.
 */
const RichTextInput = ({ value, onChange }) => {
  const ref = useRef(null);

  // Seed on mount and re-sync when `value` changes externally (e.g. a list
  // reorder) — but never while the field is focused, so typing isn't clobbered.
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    const clean = sanitizeHtml(value || '');
    if (el.innerHTML !== clean) el.innerHTML = clean;
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(sanitizeHtml(ref.current.innerHTML));
  };

  const exec = (cmd, arg) => {
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^(https?:|mailto:|tel:)/i.test(url)) exec('createLink', url);
  };

  return (
    <div className="admin-rte">
      <div className="admin-rte__bar">
        <button type="button" className="admin-btn admin-btn--sm"
          onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}><b>B</b></button>
        <button type="button" className="admin-btn admin-btn--sm"
          onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}><i>I</i></button>
        <button type="button" className="admin-btn admin-btn--sm"
          onMouseDown={(e) => { e.preventDefault(); addLink(); }}>Link</button>
      </div>
      <div
        ref={ref}
        className="admin-input admin-rte__area"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
      />
    </div>
  );
};

export default RichTextInput;
