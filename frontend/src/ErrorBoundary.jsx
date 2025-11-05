import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20}}>
          <h1>Ocorreu um erro na aplicação</h1>
          <p style={{whiteSpace: 'pre-wrap'}}>{String(this.state.error)}</p>
          {this.state.info && (
            <details style={{whiteSpace: 'pre-wrap'}}>
              {this.state.info.componentStack}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
