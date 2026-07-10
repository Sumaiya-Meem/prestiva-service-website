import React from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

/**
 * Render admin-editable HTML safely (DOMPurify-sanitized, allow-listed to
 * bold/italic/links/breaks). Plain text passes through unchanged.
 * `as` chooses the wrapper element (default <span>).
 */
const RichText = ({ html, as = 'span', ...rest }) =>
  React.createElement(as, {
    ...rest,
    dangerouslySetInnerHTML: { __html: sanitizeHtml(html) },
  });

export default RichText;
