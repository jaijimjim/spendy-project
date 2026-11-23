import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  House,
  Images,
  ImageUp,
  ListOrdered,
  LockKeyhole,
  PencilLine,
  Plus,
  Settings,
  TriangleAlert,
} from 'lucide-react';
import { LangSwitch } from '../components/LangSwitch';
import { Banner, LiveRegion, ToastHost } from '../components/Feedback';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { googlePhotos } from '../services/google';
import { useOnline } from './useOnline';
import { downloadText } from '../services/download';
import { today } from '../services/clock';
import { ACCEPT_ATTR, filesFromList, useEnqueueFiles } from '../features/add/useEnqueue';
import { ErrorBoundary } from './ErrorBoundary';
import s from './shell.module.css';
import { cn } from '../components/cn';

function BrandMark() {
  return (
    <svg className={s.brandMark} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--omx-color-primary)" />
      <circle
        cx="32"
        cy="32"
        r="17"
        fill="none"
        stroke="var(--omx-color-on-primary)"
        strokeWidth="5"
      />
      <path
        d="M24 32h16M32 24v16"
        stroke="var(--omx-color-accent)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppBanners() {
  const { t } = useTranslation();
  const banners = useAppStore((st) => st.banners);
  const dismiss = useAppStore((st) => st.dismissBanner);
  const rawCorrupt = useAppStore((st) => st.rawCorruptValue);
  const transactions = useAppStore((st) => st.transactions);
  const online = useOnline();
  const exportJson = () =>
    downloadText(
      `spendy-money-backup-${today().replace(/-/g, '')}.json`,
      JSON.stringify(
        {
          app: 'spendy-money',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          transactions,
        },
        null,
        2,
      ),
      'application/json',
    );
  const items = [
    !online && (
      <Banner key="offline" variant="warning">
        <strong>{t('error.offlineTitle')}</strong> — {t('error.offlineBody')}
      </Banner>
    ),
    banners.storageUnavailable && (
      <Banner key="unavailable" variant="info" onDismiss={() => dismiss('storageUnavailable')}>
        {t('error.storageUnavailable')}
      </Banner>
    ),
    banners.storageFull && (
      <Banner
        key="full"
        variant="warning"
        onDismiss={() => dismiss('storageFull')}
        action={
          <Button variant="secondary" size="sm" onClick={exportJson}>
            {t('error.storageFullAction')}
          </Button>
        }
      >
        {t('error.storageFull')}
      </Banner>
    ),
    banners.corruptKey && (
      <Banner
        key="corrupt"
        variant="danger"
        onDismiss={() => dismiss('corruptKey')}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadText(
                `spendy-money-raw-${today().replace(/-/g, '')}.json`,
                rawCorrupt() ?? '',
                'application/json',
              )
            }
          >
            {t('error.corruptDataAction')}
          </Button>
        }
      >
        {t('error.corruptData')}
      </Banner>
    ),
    banners.otherTab && (
      <Banner key="tab" variant="info" onDismiss={() => dismiss('otherTab')}>
        {t('error.otherTabUpdated')}
      </Banner>
    ),
  ].filter(Boolean);
  if (!items.length) return null;
  return <div className={s.banners}>{items}</div>;
}

/** Add action sheet (screens.md §1): Upload · Google Photos · Manual. */
function AddSheet() {
  const { t } = useTranslation();
  const open = useUiStore((st) => st.addSheetOpen);
  const setOpen = useUiStore((st) => st.setAddSheetOpen);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const enqueueFiles = useEnqueueFiles();
  const gpConfigured = googlePhotos().isConfigured();

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        hidden
        data-testid="sheet-file-input"
        onChange={(e) => {
          const files = filesFromList(e.target.files);
          e.target.value = '';
          if (!files.length) return;
          navigate('/add');
          void enqueueFiles(files);
        }}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('addSheet.title')} variant="sheet">
        <ul className={s.sheetList}>
          <li>
            <button
              type="button"
              className={s.sheetRow}
              onClick={() => {
                setOpen(false);
                // Open the picker in the same user gesture (screens.md §1).
                fileRef.current?.click();
              }}
            >
              <span className={s.sheetIcon} aria-hidden="true">
                <ImageUp size={22} />
              </span>
              <span className={s.sheetText}>
                <span className={s.sheetTitle}>{t('addSheet.upload')}</span>
                <span className={s.sheetHint}>{t('addSheet.uploadHint')}</span>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </li>
          <li>
            <button
              type="button"
              className={s.sheetRow}
              aria-disabled={!gpConfigured || undefined}
              onClick={() => {
                if (!gpConfigured) return;
                setOpen(false);
                navigate('/add', { state: { startGoogle: true } });
              }}
            >
              <span className={s.sheetIcon} aria-hidden="true">
                <Images size={22} />
              </span>
              <span className={s.sheetText}>
                <span className={s.sheetTitle}>{t('addSheet.googlePhotos')}</span>
                {gpConfigured ? (
                  <span className={s.sheetHint}>{t('addSheet.googlePhotosHint')}</span>
                ) : (
                  <span className={s.sheetWarn}>
                    <TriangleAlert size={16} aria-hidden="true" />
                    {t('googlePhotos.notConfigured')}
                  </span>
                )}
              </span>
              {gpConfigured && <ChevronRight size={20} aria-hidden="true" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={s.sheetRow}
              onClick={() => {
                setOpen(false);
                navigate('/transactions/new');
              }}
            >
              <span className={s.sheetIcon} aria-hidden="true">
                <PencilLine size={22} />
              </span>
              <span className={s.sheetText}>
                <span className={s.sheetTitle}>{t('addSheet.manual')}</span>
                <span className={s.sheetHint}>{t('addSheet.manualHint')}</span>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </li>
        </ul>
        <p className={s.trust}>
          <LockKeyhole size={18} aria-hidden="true" />
          {t('addSlip.trust')}
        </p>
      </Modal>
    </>
  );
}

/** Focus the h1 after every route change except the first paint (OMX-027 AC2). */
function useRouteFocus() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('main [data-page-title]')?.focus();
      window.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);
}

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const addOpen = useUiStore((st) => st.addSheetOpen);
  const setAddOpen = useUiStore((st) => st.setAddSheetOpen);
  useRouteFocus();
  const focusedFlow =
    location.pathname === '/add/review' || location.pathname.startsWith('/transactions/');
  const isAdd = location.pathname.startsWith('/add');

  const navItems = [
    { to: '/', label: t('nav.home'), Icon: House, end: true },
    { to: '/transactions', label: t('nav.transactions'), Icon: ListOrdered, end: false },
  ];

  return (
    <div className={s.layout}>
      <a
        className={s.skip}
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {t('app.skipToContent')}
      </a>
      <aside className={s.sideNav} aria-label={t('nav.label')}>
        <div className={s.brand}>
          <BrandMark />
          {t('app.name')}
        </div>
        <Button
          icon={<Plus size={20} aria-hidden="true" />}
          aria-haspopup="dialog"
          aria-expanded={addOpen}
          onClick={() => setAddOpen(true)}
        >
          {t('nav.addTransaction')}
        </Button>
        <nav aria-label={t('nav.label')}>
          <ul>
            {[
              ...navItems,
              { to: '/add', label: t('addSlip.title'), Icon: ImageUp, end: false },
              { to: '/settings', label: t('nav.settings'), Icon: Settings, end: false },
            ].map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={s.sideLink}>
                  <Icon size={22} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.sideFooter}>
          <LangSwitch />
          <p className={s.privacyLine}>
            <LockKeyhole size={16} aria-hidden="true" />
            {t('addSlip.trust')}
          </p>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className={cn(s.main, focusedFlow && s.mainFocused)}>
        <AppBanners />
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!focusedFlow && (
        <nav className={s.bottomNav} aria-label={t('nav.label')}>
          <ul>
            {navItems.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={s.navItem}>
                  <Icon size={24} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={cn(s.navItem, s.fabItem)}
                aria-haspopup="dialog"
                aria-expanded={addOpen}
                aria-current={isAdd ? 'page' : undefined}
                onClick={() => setAddOpen(true)}
              >
                <span className={s.fab} aria-hidden="true">
                  <Plus size={28} />
                </span>
                {t('nav.add')}
              </button>
            </li>
            <li>
              <NavLink to="/settings" className={s.navItem}>
                <Settings size={24} aria-hidden="true" />
                {t('nav.settings')}
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
      <AddSheet />
      <ToastHost />
      <LiveRegion />
    </div>
  );
}
