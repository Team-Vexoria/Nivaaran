import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundaries catch render-time / lifecycle errors in the lazy-loaded
 * portal chunks (and anywhere they wrap) so a crash in one module never
 * blanks the whole app. On error it shows a recover card with a "Try Again"
 * retry that resets state and re-mounts the subtree.
 *
 * NB: Error Boundaries do NOT catch async errors, event-handler errors, or
 * errors thrown inside the boundary itself — those are handled elsewhere.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console for diagnostics; replace with a reporting SDK in prod.
    console.error('[ErrorBoundary] Caught an error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-terracotta/30 max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-terracotta">Something went wrong</h2>
          <p className="text-sm text-charcoal/70">
            A part of NIVAARAN crashed while rendering. This is usually a transient
            chunk-load failure and can be safely retried.
          </p>
          {this.state.error?.message && (
            <p className="text-[11px] font-mono text-charcoal/50 bg-page border border-sand rounded-lg px-3 py-2 break-words">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="px-5 py-2 bg-terracotta hover:bg-terracotta/90 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
