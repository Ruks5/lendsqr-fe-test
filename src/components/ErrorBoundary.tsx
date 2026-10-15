import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StateMessage } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last line of defence: a render error shows a recoverable screen, not a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for an error reporter (Sentry etc.).
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '10vh 16px' }}>
          <StateMessage
            variant="error"
            title="Something went wrong"
            description="An unexpected error stopped this page from loading. Reloading usually fixes it."
            actionLabel="Reload page"
            onAction={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
