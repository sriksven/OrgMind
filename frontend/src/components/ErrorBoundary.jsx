import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    if (typeof this.props.onRetry === 'function') {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary glass">
          <h3>Something went wrong</h3>
          <p className="subtle">{this.state.error?.message || 'Unexpected UI error.'}</p>
          <button className="btn secondary" onClick={this.handleRetry}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
