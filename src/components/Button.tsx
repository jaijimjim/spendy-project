import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import s from './ui.module.css';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  block?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  /** Uses aria-disabled so the control stays focusable and its reason reachable (§6.1). */
  disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block,
    icon,
    loading,
    disabled,
    className,
    onClick,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const inert = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={cn(s.btn, s[variant], size === 'sm' && s.sm, block && s.block, className)}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (inert) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? <span className={s.spinner} aria-hidden="true" /> : icon}
      {children}
    </button>
  );
});

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  label: string;
  disabled?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, disabled, className, onClick, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(s.iconBtn, className)}
      aria-label={label}
      aria-disabled={disabled || undefined}
      onClick={(e) => (disabled ? e.preventDefault() : onClick?.(e))}
      {...rest}
    >
      {children}
    </button>
  );
});
