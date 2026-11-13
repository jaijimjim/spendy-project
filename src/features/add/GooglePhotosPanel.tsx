/** Google Photos Picker states (screens.md §5, OMX-003a/b, OMX-004). Inline — no modal. */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Images, TriangleAlert } from 'lucide-react';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/Feedback';
import {
  googlePhotos,
  GoogleError,
  type GoogleErrorCode,
  type PickedItem,
  type PickerSession,
} from '../../services/google';
import { useUiStore } from '../../store/uiStore';
import { useEnqueueFiles, useSkipMessage } from './useEnqueue';
import { summarizeSkips } from '../../domain/file';
import s from './add.module.css';
import { cn } from '../../components/cn';

type Phase =
  | { kind: 'idle' }
  | { kind: 'preConsent' }
  | { kind: 'authorizing' }
  | { kind: 'waiting'; session: PickerSession }
  | { kind: 'downloading'; current: number; total: number }
  | { kind: 'error'; code: GoogleErrorCode };

const ACCEPTED = /^image\/(jpeg|png|webp)$/i;

export function GooglePhotosPanel({ autoStart }: { autoStart?: boolean }) {
  const { t } = useTranslation();
  const api = googlePhotos();
  const configured = api.isConfigured();
  const [phase, setPhase] = useState<Phase>({
    kind: autoStart && configured ? 'preConsent' : 'idle',
  });
  const cancelled = useRef(false);
  const enqueueFiles = useEnqueueFiles();
  const skipMessage = useSkipMessage();
  const showToast = useUiStore((st) => st.showToast);
  const announce = useUiStore((st) => st.announce);

  useEffect(() => () => void (cancelled.current = true), []);

  const fail = (e: unknown) =>
    setPhase({ kind: 'error', code: e instanceof GoogleError ? e.code : 'network' });

  const openPicker = (session: PickerSession) => {
    // Opened from a click handler → same user gesture (no popup blocker) — OMX-003a AC2.
    const w = window.open(session.pickerUri, '_blank', 'noopener');
    return w !== null;
  };

  async function poll(session: PickerSession) {
    let current = session;
    while (!cancelled.current) {
      if (Date.now() > current.expiresAt) {
        void api.deleteSession(current.id);
        return setPhase({ kind: 'error', code: 'timeout' });
      }
      await new Promise((r) => setTimeout(r, current.pollIntervalMs));
      if (cancelled.current) return;
      try {
        current = await api.getSession(current.id);
      } catch (e) {
        return fail(e);
      }
      if (current.mediaItemsSet) break;
    }
    if (cancelled.current) return;
    let items: PickedItem[];
    try {
      items = await api.listItems(current.id);
    } catch (e) {
      return fail(e);
    }
    await download(items, current.id);
  }

  async function download(items: PickedItem[], sessionId: string) {
    const photos = items.filter((i) => i.type !== 'VIDEO' && ACCEPTED.test(i.mimeType));
    const skippedType = items.length - photos.length;
    if (!items.length) {
      void api.deleteSession(sessionId);
      return setPhase({ kind: 'idle' }); // closed without selecting (AC4)
    }
    const files: { blob: Blob; name: string; origin: 'google' }[] = [];
    let failed = 0;
    for (let i = 0; i < photos.length; i++) {
      if (cancelled.current) return;
      setPhase({ kind: 'downloading', current: i + 1, total: photos.length });
      try {
        const blob = await api.download(photos[i]!);
        files.push({ blob, name: photos[i]!.filename, origin: 'google' });
      } catch {
        failed++;
      }
    }
    void api.deleteSession(sessionId);
    const r = files.length
      ? await enqueueFiles(files)
      : { added: 0, skippedCount: 0, skipped: summarizeSkips([]) };
    if (skippedType && !r.skippedCount) {
      showToast({
        message: skipMessage({ ...summarizeSkips([]), type: skippedType }, skippedType),
        variant: 'warning',
      });
    } else if (r.added) {
      showToast({ message: t('googlePhotos.imported', { count: r.added }), variant: 'success' });
    }
    if (failed) announce(t('googlePhotos.downloadFailed'));
    setPhase(failed && !files.length ? { kind: 'error', code: 'network' } : { kind: 'idle' });
  }

  async function start() {
    cancelled.current = false;
    if (!navigator.onLine) return setPhase({ kind: 'error', code: 'network' });
    setPhase({ kind: 'authorizing' });
    try {
      await api.authorize();
      const session = await api.createSession();
      setPhase({ kind: 'waiting', session });
      openPicker(session); // may be blocked after the async consent popup; "Reopen" is a fresh gesture
      void poll(session);
    } catch (e) {
      fail(e);
    }
  }

  const cancel = () => {
    cancelled.current = true;
    if (phase.kind === 'waiting') void api.deleteSession(phase.session.id);
    setPhase({ kind: 'idle' });
  };

  if (!configured) {
    return (
      <div className={s.gpPanel}>
        <Button
          variant="secondary"
          block
          disabled
          icon={<Images size={20} aria-hidden="true" />}
          aria-describedby="gp-nc"
        >
          {t('googlePhotos.button')}
        </Button>
        <p id="gp-nc" className={cn(s.gpMsg, s.gpWarn)}>
          <TriangleAlert size={16} aria-hidden="true" />
          {t('googlePhotos.notConfigured')}
        </p>
      </div>
    );
  }

  return (
    <div className={s.gpPanel} aria-live="polite">
      {(phase.kind === 'idle' || phase.kind === 'error') && (
        <Button
          variant="secondary"
          block
          icon={<Images size={20} aria-hidden="true" />}
          onClick={() => setPhase({ kind: 'preConsent' })}
        >
          {t('googlePhotos.button')}
        </Button>
      )}
      {phase.kind === 'error' && (
        <p className={cn(s.gpMsg, s.gpError)} role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {t(`googlePhotos.${phase.code === 'popupBlocked' ? 'denied' : phase.code}`)}{' '}
        </p>
      )}
      {phase.kind === 'error' && (
        <Button variant="ghost" size="sm" onClick={() => void start()}>
          {t('common.tryAgain')}
        </Button>
      )}
      {(phase.kind === 'preConsent' || phase.kind === 'authorizing') && (
        <>
          <p>
            <strong>{t('googlePhotos.preConsent')}</strong>
          </p>
          <p className={s.rules}>{t('googlePhotos.preConsentDetail')}</p>
          <Button loading={phase.kind === 'authorizing'} onClick={() => void start()}>
            {t('googlePhotos.continue')}
          </Button>
          <Button variant="ghost" onClick={cancel}>
            {t('common.cancel')}
          </Button>
        </>
      )}
      {phase.kind === 'waiting' && (
        <>
          <ProgressBar value={0} indeterminate label={t('googlePhotos.waiting')} />
          <p>
            <strong>{t('googlePhotos.waiting')}</strong>
          </p>
          <p className={s.rules}>{t('googlePhotos.waitingHint')}</p>
          <Button variant="secondary" onClick={() => openPicker(phase.session)}>
            {t('googlePhotos.reopen')}
          </Button>
          <Button variant="ghost" onClick={cancel}>
            {t('common.cancel')}
          </Button>
        </>
      )}
      {phase.kind === 'downloading' && (
        <>
          <p>{t('googlePhotos.downloading', { current: phase.current, total: phase.total })}</p>
          <ProgressBar
            value={Math.round((phase.current / phase.total) * 100)}
            label={t('googlePhotos.downloading', { current: phase.current, total: phase.total })}
          />
        </>
      )}
    </div>
  );
}
