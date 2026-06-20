import React from 'react';
import siteConfig from '../../config/siteConfig';

/**
 * Catches render-time errors anywhere in the tree and shows a friendly
 * fallback (with a way to reload + call us) instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for debugging; could be wired to an error-reporting service later.
    console.error('Caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, #0A1628, #1B2D4F)', color: '#fff'
        }}>
          <div style={{ maxWidth: '480px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h1 style={{ color: '#fff', marginBottom: '12px' }}>Something went wrong</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '28px' }}>
              Sorry for the inconvenience. Please refresh the page — or call us and we'll help right away.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{ cursor: 'pointer' }}
              >
                Refresh Page
              </button>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
                Call {siteConfig.phone}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
