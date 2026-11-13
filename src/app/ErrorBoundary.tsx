import { Component, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import i18n from '../i18n';
import ui from '../components/ui.module.css';
import { cn } from '../components/cn';

interface State {
  failed: boolean;
}

/**
 * OMX-026 AC3: friendly message + Reload, no stack trace or financial data on screen.
 * Stored data is untouched (the store lives outside the React tree).
 */
export class ErrorBoundary extends Component<{ children: ReactNode; compact?: boolean }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    // Log only the message locally — never send anywhere (OMX-030).
    console.error('[omx] render error', error instanceof Error ? error.message : 'unknown');
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={cn(ui.card, ui.empty)} role="alert">
        <div className={ui.emptyIcon} aria-hidden="true">
          <CircleAlert size={40} />
        </div>
        <h2 className={ui.emptyTitle}>{i18n.t('error.boundaryTitle')}</h2>
        {!this.props.compact && <p className={ui.emptyBody}>{i18n.t('error.boundaryBody')}</p>}
        <button
          type="button"
          className={cn(ui.btn, ui.primary)}
          onClick={() => window.location.reload()}
        >
          {i18n.t('error.boundaryAction')}
        </button>
      </div>
    );
  }
}
