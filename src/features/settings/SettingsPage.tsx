/** Settings (OMX-021 AC7, 022, 023, 024, 030) — screens.md §7. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Download,
  FileUp,
  Languages,
  ShieldCheck,
  Trash2,
  Check,
  CircleAlert,
} from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { LangSwitch } from '../../components/LangSwitch';
import { Button } from '../../components/Button';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { useAppStore } from '../../store/appStore';
import { useQueueStore } from '../../store/queueStore';
import { useUiStore } from '../../store/uiStore';
import {
  buildBackup,
  mergeTransactions,
  parseBackup,
  type BackupParseError,
} from '../../domain/schema';
import { toCsv } from '../../domain/csv';
import { inMonth } from '../../domain/transactions';
import type { Transaction } from '../../domain/types';
import { downloadText } from '../../services/download';
import { nowIso, today } from '../../services/clock';
import ui from '../../components/ui.module.css';
import s from './settings.module.css';
import { cn } from '../../components/cn';

function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const transactions = useAppStore((st) => st.transactions);
  const ym = useUiStore((st) => st.selectedMonth);
  const showToast = useUiStore((st) => st.showToast);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [scope, setScope] = useState<'month' | 'all'>('month');
  const stamp = today().replace(/-/g, '');
  const csvRows = scope === 'month' ? inMonth(transactions, ym) : transactions;

  const download = () => {
    let filename: string;
    if (format === 'json') {
      filename = `spendy-money-backup-${stamp}.json`;
      downloadText(
        filename,
        JSON.stringify(buildBackup(transactions, nowIso()), null, 2),
        'application/json',
      );
    } else {
      filename = `spendy-money-${scope === 'month' ? ym : 'all'}-${stamp}.csv`;
      downloadText(
        filename,
        toCsv(csvRows, (id) => t(`categories.${id}`)),
        'text/csv;charset=utf-8',
      );
    }
    showToast({ message: t('exportDialog.done', { filename }), variant: 'success' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('exportDialog.title')} wide>
      <fieldset className={s.radioGroup}>
        <legend>{t('exportDialog.format')}</legend>
        {(['json', 'csv'] as const).map((v) => (
          <label key={v} className={s.radioCard}>
            <input
              type="radio"
              name="fmt"
              value={v}
              checked={format === v}
              onChange={() => setFormat(v)}
            />
            <span>
              <span className={s.rowTitle}>{t(`exportDialog.${v}`)}</span>
              <br />
              <span className={s.rowHint}>{t(`exportDialog.${v}Hint`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {format === 'csv' && (
        <fieldset className={s.radioGroup}>
          <legend>{t('exportDialog.scope')}</legend>
          {(['month', 'all'] as const).map((v) => (
            <label key={v} className={s.radioCard}>
              <input
                type="radio"
                name="scope"
                value={v}
                checked={scope === v}
                onChange={() => setScope(v)}
              />
              <span>{t(v === 'month' ? 'exportDialog.scopeMonth' : 'exportDialog.scopeAll')}</span>
            </label>
          ))}
          {csvRows.length === 0 && <p className={ui.helper}>{t('exportDialog.emptyRange')}</p>}
        </fieldset>
      )}
      <div className={ui.dialogActions}>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button icon={<Download size={20} aria-hidden="true" />} onClick={download}>
          {t('exportDialog.download')}
        </Button>
      </div>
    </Modal>
  );
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const current = useAppStore((st) => st.transactions);
  const importMerge = useAppStore((st) => st.importMerge);
  const importReplace = useAppStore((st) => st.importReplace);
  const showToast = useUiStore((st) => st.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<BackupParseError | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [confirmReplace, setConfirmReplace] = useState(false);

  useEffect(() => {
    if (open) {
      setParsed(null);
      setError(null);
      setMode('merge');
    }
  }, [open]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setParsed(null);
    const text = file.size > 5 * 1024 * 1024 ? '' : await file.text();
    const r = parseBackup(text, file.size);
    if (r.ok) {
      setParsed(r.transactions);
      setError(null);
    } else setError(r.error);
  };

  const doImport = () => {
    if (!parsed) return;
    if (mode === 'replace') {
      if (importReplace(parsed))
        showToast({
          message: t('importDialog.imported', { count: parsed.length }),
          variant: 'success',
        });
    } else {
      const r = importMerge(parsed);
      if (r.ok)
        showToast({ message: t('importDialog.imported', { count: r.added }), variant: 'success' });
    }
    onClose();
  };

  const dupes = parsed ? mergeTransactions(current, parsed).duplicates : 0;

  return (
    <>
      <Modal
        open={open && !confirmReplace}
        onClose={() => !confirmReplace && onClose()}
        title={t('importDialog.title')}
        wide
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void onFile(e.target.files?.[0]).finally(() => (e.target.value = ''))}
        />
        <Button
          variant="secondary"
          icon={<FileUp size={20} aria-hidden="true" />}
          onClick={() => fileRef.current?.click()}
        >
          {t('importDialog.choose')}
        </Button>
        {error && (
          <p className={ui.error} role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            {t(`importDialog.${error}`)} — {t('importDialog.nothingChanged')}
          </p>
        )}
        {parsed && (
          <>
            <p aria-live="polite">
              {t('importDialog.preview', { total: parsed.length, duplicates: dupes })}
            </p>
            <fieldset className={s.radioGroup}>
              {(['merge', 'replace'] as const).map((v) => (
                <label key={v} className={s.radioCard}>
                  <input
                    type="radio"
                    name="importMode"
                    value={v}
                    checked={mode === v}
                    onChange={() => setMode(v)}
                  />
                  <span>
                    <span className={s.rowTitle}>{t(`importDialog.${v}`)}</span>
                    <br />
                    <span className={s.rowHint}>{t(`importDialog.${v}Hint`)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </>
        )}
        <div className={ui.dialogActions}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!parsed}
            onClick={() => (mode === 'replace' ? setConfirmReplace(true) : doImport())}
          >
            {t('importDialog.importButton')}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmReplace}
        destructive
        title={t('importDialog.replaceConfirmTitle')}
        body={t('importDialog.replaceConfirmBody', { count: current.length })}
        confirmLabel={t('importDialog.replace')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setConfirmReplace(false);
          doImport();
        }}
        onCancel={() => setConfirmReplace(false)}
      />
    </>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const count = useAppStore((st) => st.transactions.length);
  const deleteAll = useAppStore((st) => st.deleteAll);
  const clearQueue = useQueueStore((st) => st.clear);
  const showToast = useUiStore((st) => st.showToast);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (location.hash === '#privacy') document.getElementById('privacy')?.scrollIntoView();
  }, [location.hash]);

  return (
    <>
      <PageHeader title={t('settings.title')} showLang={false} />
      <div className={s.grid}>
        <div className={s.col}>
          <section className={ui.card} aria-labelledby="set-lang">
            <div className={s.langRow}>
              <h2 id="set-lang" className={cn(ui.row, s.rowTitle)}>
                <Languages size={20} aria-hidden="true" />
                {t('settings.language')}
              </h2>
              <LangSwitch />
            </div>
          </section>

          <section aria-labelledby="set-data">
            <h2 id="set-data" className={s.sectionTitle}>
              {t('settings.dataSection')}
            </h2>
            <div className={ui.card}>
              <button
                type="button"
                className={s.rowBtn}
                aria-disabled={count === 0 || undefined}
                aria-describedby="set-count"
                onClick={() => count > 0 && setExportOpen(true)}
              >
                <span className={s.rowIcon} aria-hidden="true">
                  <Download size={20} />
                </span>
                <span className={s.rowText}>
                  <span className={s.rowTitle}>{t('settings.export')}</span>
                  <span className={s.rowHint}>{t('settings.exportHint')}</span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
              <button type="button" className={s.rowBtn} onClick={() => setImportOpen(true)}>
                <span className={s.rowIcon} aria-hidden="true">
                  <FileUp size={20} />
                </span>
                <span className={s.rowText}>
                  <span className={s.rowTitle}>{t('settings.import')}</span>
                  <span className={s.rowHint}>{t('settings.importHint')}</span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
              <p id="set-count" className={s.info}>
                {t('settings.transactionCount', { count })} · {t('settings.storageInfo')}
              </p>
            </div>
          </section>

          <section className={cn(ui.card, s.danger)} aria-labelledby="set-danger">
            <h2 id="set-danger" className={cn(s.rowTitle, s.dangerTitle)}>
              {t('settings.dangerZone')}
            </h2>
            <p className={s.info}>{t('settings.deleteAllHint')}</p>
            <div style={{ marginTop: 12 }}>
              <Button
                variant="dangerGhost"
                block
                icon={<Trash2 size={20} aria-hidden="true" />}
                onClick={() => setConfirmDelete(true)}
              >
                {t('settings.deleteAll')}
              </Button>
            </div>
          </section>
        </div>

        <div className={s.col}>
          <section id="privacy" aria-labelledby="set-privacy">
            <h2 id="set-privacy" className={s.sectionTitle}>
              {t('settings.privacySection')}
            </h2>
            <div className={ui.card}>
              <p className={s.privacyTitle}>
                <ShieldCheck size={20} aria-hidden="true" />
                {t('settings.privacyTitle')}
              </p>
              <ul className={s.bullets}>
                {[1, 2, 3, 4].map((n) => (
                  <li key={n}>
                    <Check size={16} aria-hidden="true" />
                    {t(`settings.privacyBody${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className={ui.card} aria-labelledby="set-about">
            <h2 id="set-about" className={s.rowTitle}>
              {t('settings.about')}
            </h2>
            <p className={s.info}>
              {t('app.name')} — {t('app.tagline')}
              <br />
              {t('settings.version', { version: __APP_VERSION__ })}
            </p>
          </section>
        </div>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={confirmDelete}
        destructive
        title={t('dialog.deleteAllTitle')}
        body={t('dialog.deleteAllBody')}
        confirmLabel={t('dialog.deleteAllConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setConfirmDelete(false);
          clearQueue();
          deleteAll();
          showToast({ message: t('settings.deletedAll'), variant: 'success' });
          navigate('/');
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
