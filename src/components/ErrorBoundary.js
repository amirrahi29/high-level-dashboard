import React from 'react';

import '../styles/page-loader.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="def-error-fallback" role="alert">
          <h1>Something went wrong</h1>
          <p>The dashboard hit a runtime error. Details are below.</p>
          <pre>{this.state.error?.message || String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
