/** Shared add/edit form (OMX-013, OMX-016): own route so Back closes it; validation shared with Review. */
import { useMemo, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { Button, IconButton } from '../../components/Button';
import { ConfirmDialog } from '../../components/Modal';
import {
  AmountInput,
  CategoryPicker,
  DateInput,
  Field,
  TypeToggle,
  controlClass,
  describedBy,
} from '../../components/FormControls';
import { EmptyState } from '../../components/Feedback';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { nowIso, today } from '../../services/clock';
import { parseMoneyInput, satangToInput } from '../../domain/money';
import { resetCategoryForType } from '../../domain/categories';
import {
  FIELD_ORDER,
  hasErrors,
  validateDraft,
  type Draft,
  type DraftErrors,
} from '../../domain/validation';
import type { Transaction, TxType } from '../../domain/types';
import { useFormat } from '../../i18n/format';
import s from './transactions.module.css';
import ui from '../../components/ui.module.css';

const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function draftFrom(tx: Transaction | undefined): Draft {
  if (!tx)
    return {
      type: 'expense',
      categoryId: null,
      amount: '',
      date: today(),
      time: '',
      payee: '',
      note: '',
    };
  return {
    type: tx.type,
    categoryId: tx.categoryId,
    amount: satangToInput(tx.amountSatang),
    date: tx.date,
    time: tx.time ?? '',
    payee: tx.payee ?? '',
    note: tx.note ?? '',
  };
}

export function TransactionFormPage() {
  const { t } = useTranslation();
  const f = useFormat();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const transactions = useAppStore((st) => st.transactions);
  const existing = useMemo(
    () => (id ? transactions.find((x) => x.id === id) : undefined),
    [id, transactions],
  );
  const isEdit = !!id;
  const [initial] = useState(() => draftFrom(existing));
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // Synchronous guard: `saving` state is stale inside the same event loop tick (BUG-002)
  const savingRef = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const allowLeave = useRef(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const showToast = useUiStore((st) => st.showToast);
  const announce = useUiStore((st) => st.announce);
  const add = useAppStore((st) => st.addMany);
  const update = useAppStore((st) => st.update);
  const remove = useAppStore((st) => st.remove);
  const restore = useAppStore((st) => st.restore);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname,
  );

  const goBack = () => {
    if (location.key !== 'default' && window.history.length > 1) navigate(-1);
    else navigate('/transactions');
  };

  if (isEdit && !existing) {
    return (
      <>
        <PageHeader title={t('form.editTitle')} showLang={false} />
        <div className={ui.card}>
          <EmptyState
            icon={<X size={40} />}
            title={t('error.generic')}
            actions={<Button onClick={() => navigate('/transactions')}>{t('common.back')}</Button>}
          />
        </div>
      </>
    );
  }

  const set = (p: Partial<Draft>) => {
    const next = { ...draft, ...p };
    setDraft(next);
    if (submitted) setErrors(validateDraft(next));
  };

  const setType = (type: TxType) => {
    if (type === draft.type) return;
    const categoryId = draft.categoryId ? resetCategoryForType(type, draft.categoryId) : null;
    if (draft.categoryId && categoryId !== draft.categoryId) {
      announce(t(type === 'income' ? 'categories.resetToIncome' : 'categories.resetToExpense'));
    }
    set({ type, categoryId });
  };

  const errText = (k: keyof DraftErrors) => (errors[k] ? t(`validation.${errors[k]}`) : null);
  const futureWarning = draft.date && draft.date > today() ? t('form.warnFutureDate') : null;

  const submit = (another: boolean) => {
    if (savingRef.current) return; // double-tap safe (OMX-013 AC2, BUG-002)
    setSubmitted(true);
    const e = validateDraft(draft);
    setErrors(e);
    if (hasErrors(e)) {
      const count = Object.keys(e).length;
      announce(t('validation.summary', { count }));
      const first = FIELD_ORDER.find((k) => e[k]);
      if (first) document.getElementById(`tx-${first}`)?.focus();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const money = parseMoneyInput(draft.amount);
    const now = nowIso();
    const tx: Transaction = {
      id: existing?.id ?? uid(),
      type: draft.type,
      categoryId: draft.categoryId!,
      amountSatang: money.ok ? money.satang : 0,
      date: draft.date,
      source: existing?.source ?? 'manual',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...(existing?.slip ? { slip: existing.slip } : {}),
    };
    if (draft.time) tx.time = draft.time;
    if (draft.payee.trim()) tx.payee = draft.payee.trim(); // trimmed (AC6)
    if (draft.note.trim()) tx.note = draft.note.trim();
    const ok = existing ? update(tx) : add([tx]);
    setSaving(false);
    if (!ok) {
      savingRef.current = false;
      return; // storage banner shown; form stays open with data
    }
    showToast({
      message: t(existing ? 'form.updatedToast' : 'form.savedToast'),
      variant: 'success',
    });
    if (another) {
      savingRef.current = false;
      const next: Draft = { ...draft, amount: '', payee: '', note: '' };
      setDraft(next);
      setSubmitted(false);
      setErrors({});
      amountRef.current?.focus();
      return;
    }
    allowLeave.current = true;
    if (existing) goBack();
    else navigate('/transactions', { state: { highlight: tx.id } });
  };

  const doDelete = () => {
    setConfirmDelete(false);
    const removed = existing ? remove(existing.id) : null;
    if (!removed) return;
    allowLeave.current = true;
    showToast({
      message: t('form.deletedToast'),
      variant: 'success',
      action: {
        label: t('common.undo'),
        onAction: () => {
          if (restore(removed))
            useUiStore
              .getState()
              .showToast({ message: t('form.restoredToast'), variant: 'success' });
        },
      },
    });
    navigate('/transactions');
  };

  return (
    <>
      <PageHeader
        title={t(isEdit ? 'form.editTitle' : 'form.addTitle')}
        showLang={false}
        lead={
          <IconButton label={t('common.close')} onClick={goBack}>
            <X size={24} aria-hidden="true" />
          </IconButton>
        }
      />
      <form
        className={s.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <div className={ui.field}>
          <span className={ui.label} id="tx-type-label">
            {t('type.label')}
          </span>
          <TypeToggle value={draft.type} onChange={setType} />
        </div>
        <Field id="tx-amount" label={t('form.amount')} error={errText('amount')}>
          <AmountInput
            id="tx-amount"
            value={draft.amount}
            onChange={(amount) => set({ amount })}
            error={errText('amount')}
            inputRef={amountRef}
            autoFocus={!isEdit}
          />
        </Field>
        <Field id="tx-categoryId" label={t('categories.label')} error={errText('categoryId')}>
          <CategoryPicker
            id="tx-categoryId"
            type={draft.type}
            value={draft.categoryId}
            onChange={(categoryId) => set({ categoryId })}
            error={errText('categoryId')}
          />
        </Field>
        <div className={s.twoCol}>
          <Field
            id="tx-date"
            label={t('form.date')}
            error={errText('date')}
            warning={futureWarning}
          >
            <DateInput
              id="tx-date"
              value={draft.date}
              onChange={(date) => set({ date })}
              error={errText('date')}
              warning={futureWarning}
            />
          </Field>
          <Field id="tx-time" label={t('form.time')} optional error={errText('time')}>
            <div className={controlClass(errText('time'))}>
              <input
                id="tx-time"
                type="time"
                value={draft.time}
                aria-describedby={describedBy('tx-time', !!errors.time)}
                onChange={(e) => set({ time: e.target.value })}
              />
            </div>
          </Field>
        </div>
        <Field id="tx-payee" label={t('form.payee')} optional error={errText('payee')}>
          <div className={controlClass(errText('payee'))}>
            <input
              id="tx-payee"
              maxLength={120}
              placeholder={t('form.payeePlaceholder')}
              value={draft.payee}
              aria-invalid={!!errors.payee || undefined}
              aria-describedby={describedBy('tx-payee', !!errors.payee)}
              onChange={(e) => set({ payee: e.target.value })}
            />
          </div>
        </Field>
        <Field id="tx-note" label={t('form.note')} optional error={errText('note')}>
          <div className={controlClass(errText('note'))}>
            <textarea
              id="tx-note"
              rows={3}
              maxLength={520}
              placeholder={t('form.notePlaceholder')}
              value={draft.note}
              aria-invalid={!!errors.note || undefined}
              aria-describedby={describedBy('tx-note', !!errors.note)}
              onChange={(e) => set({ note: e.target.value })}
            />
          </div>
        </Field>
        {isEdit && existing && (
          <div className={s.danger}>
            <Button
              variant="dangerGhost"
              block
              icon={<Trash2 size={20} aria-hidden="true" />}
              onClick={() => setConfirmDelete(true)}
            >
              {t('form.deleteTransaction')}
            </Button>
          </div>
        )}
        <div className={s.formFooter}>
          <div className={s.formFooterInner}>
            {!isEdit && (
              <Button variant="ghost" onClick={() => submit(true)}>
                {t('form.saveAndAddAnother')}
              </Button>
            )}
            <Button type="submit" loading={saving} block>
              {saving ? t('common.saving') : t('form.save')}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title={t('dialog.deleteTitle')}
        body={
          existing
            ? t('dialog.deleteBody', {
                name: existing.payee || t(`categories.${existing.categoryId}`),
                amount: f.money(existing.amountSatang),
              })
            : ''
        }
        confirmLabel={t('dialog.deleteConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        destructive
        title={t('dialog.discardFormTitle')}
        body={t('dialog.discardFormBody')}
        confirmLabel={t('dialog.discardFormConfirm')}
        cancelLabel={t('dialog.keepEditing')}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}
