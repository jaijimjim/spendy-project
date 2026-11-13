/**
 * Native <dialog> wrapper (OMX-027 AC1): showModal() gives focus trap + Esc; focus returns to the
 * opener on close. Renders as a centered dialog or a bottom sheet.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import s from './ui.module.css';
import { cn } from './cn';
import { IconButton } from './Button';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'dialog' | 'sheet';
  wide?: boolean;
  /** Element to focus first (defaults to the first focusable). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  hideTitle?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  variant = 'dialog',
  wide,
  initialFocusRef,
  className,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const opener = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      requestAnimationFrame(() => initialFocusRef?.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, initialFocusRef]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => {
      const el = opener.current as HTMLElement | null;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus();
      onCloseRef.current();
    };
    d.addEventListener('close', handleClose);
    return () => d.removeEventListener('close', handleClose);
  }, []);

  const { t } = useTranslation();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(variant === 'sheet' ? s.sheet : s.dialog, wide && s.dialogWide, className)}
      onClick={(e) => {
        // click on the backdrop (the dialog element itself) closes
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {open &&
        (variant === 'sheet' ? (
          <>
            <div className={s.sheetHandle} aria-hidden="true" />
            <div className={s.sheetHeader}>
              <h2 id={titleId} className={s.dialogTitle}>
                {title}
              </h2>
              <IconButton label={t('common.close')} onClick={() => ref.current?.close()}>
                <X size={22} aria-hidden="true" />
              </IconButton>
            </div>
            <div className={s.sheetBody}>{children}</div>
          </>
        ) : (
          <div className={s.dialogInner}>
            <h2 id={titleId} className={s.dialogTitle}>
              {title}
            </h2>
            {children}
          </div>
        ))}
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirm dialog — destructive confirms put initial focus on Cancel (§6.18). */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef(false);
  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!confirmedRef.current) onCancel();
        confirmedRef.current = false;
      }}
      initialFocusRef={destructive ? cancelRef : confirmRef}
    >
      <p className={s.dialogBody}>{body}</p>
      <div className={s.dialogActions}>
        <button ref={cancelRef} type="button" className={cn(s.btn, s.secondary)} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          ref={confirmRef}
          type="button"
          className={cn(s.btn, destructive ? s.danger : s.primary)}
          onClick={() => {
            confirmedRef.current = true;
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
