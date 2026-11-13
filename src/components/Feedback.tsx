import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import s from './ui.module.css';
import { cn } from './cn';
import { IconButton } from './Button';
import { useUiStore } from '../store/uiStore';

/** Single polite live region in the shell (design-system §7.2). */
export function LiveRegion() {
  const announcement = useUiStore((st) => st.announcement);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!announcement.text) return;
    setText('');
    const id = window.setTimeout(() => setText(announcement.text), 50);
    return () => window.clearTimeout(id);
  }, [announcement]);
  return (
    <div className="omx-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}

const TOAST_ICONS = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
};

/** Toast host — 5s default, ≥ 6s with an action and paused while hovered/focused (§6.6, WCAG 2.2.1). */
export function ToastHost() {
  const toast = useUiStore((st) => st.toast);
  const hide = useUiStore((st) => st.hideToast);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(0);

  useEffect(() => {
    if (!toast) return;
    remaining.current = toast.action ? 6500 : 5000;
  }, [toast]);

  useEffect(() => {
    if (!toast || paused) return;
    const started = Date.now();
    const id = window.setTimeout(() => hide(toast.id), remaining.current);
    return () => {
      window.clearTimeout(id);
      remaining.current -= Date.now() - started;
    };
  }, [toast, paused, hide]);

  const Icon = toast ? TOAST_ICONS[toast.variant] : CircleCheck;
  return (
    <div className={s.toastRegion} role="status" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className={cn(
            s.toast,
            toast.variant === 'warning' && s.toastWarning,
            toast.variant === 'error' && s.toastError,
            toast.variant === 'info' && s.toastInfo,
          )}
          data-testid="toast"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Icon size={20} className={s.toastIcon} aria-hidden="true" />
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className={cn(s.btn, s.ghost, s.sm)}
              onClick={() => {
                toast.action!.onAction();
                hide(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface BannerProps {
  variant: 'info' | 'warning' | 'danger';
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}

export function Banner({ variant, children, action, onDismiss }: BannerProps) {
  const { t } = useTranslation();
  const Icon = variant === 'info' ? Info : TriangleAlert;
  return (
    <div
      className={cn(
        s.banner,
        variant === 'info'
          ? s.bannerInfo
          : variant === 'warning'
            ? s.bannerWarning
            : s.bannerDanger,
      )}
      role={variant === 'danger' ? 'alert' : 'status'}
    >
      <Icon size={20} aria-hidden="true" />
      <div>
        <p className={s.bannerText}>{children}</p>
        {action}
      </div>
      {onDismiss && (
        <IconButton label={t('common.dismiss')} onClick={onDismiss}>
          <X size={18} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}

interface EmptyProps {
  icon: ReactNode;
  title: string;
  body?: string;
  actions?: ReactNode;
}

export function EmptyState({ icon, title, body, actions }: EmptyProps) {
  return (
    <div className={s.empty}>
      <div className={s.emptyIcon} aria-hidden="true">
        {icon}
      </div>
      <h2 className={s.emptyTitle}>{title}</h2>
      {body && <p className={s.emptyBody}>{body}</p>}
      {actions && <div className={s.emptyActions}>{actions}</div>}
    </div>
  );
}

export function Skeleton({
  width = '100%',
  height = 16,
  round,
}: {
  width?: string | number;
  height?: number;
  round?: boolean;
}) {
  return (
    <div
      className={s.skeleton}
      style={{ width, height, borderRadius: round ? 999 : undefined }}
      aria-hidden="true"
    />
  );
}

export function ProgressBar({
  value,
  label,
  indeterminate,
}: {
  value: number;
  label: string;
  indeterminate?: boolean;
}) {
  return (
    <div
      className={cn(s.progress, indeterminate && s.progressIndeterminate)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
    >
      <div className={s.progressBar} style={{ width: `${value}%` }} />
    </div>
  );
}
