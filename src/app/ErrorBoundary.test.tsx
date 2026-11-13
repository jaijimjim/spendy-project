import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { initI18n } from '../i18n';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('secret 1,234.00 THB');
}

describe('ErrorBoundary (OMX-026 AC3)', () => {
  it('shows a friendly message with Reload and no error details', () => {
    initI18n('en');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(screen.queryByText(/1,234/)).toBeNull();
    spy.mockRestore();
  });
});
