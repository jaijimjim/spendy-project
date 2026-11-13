import { useTranslation } from 'react-i18next';
import type { Language } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import s from './ui.module.css';

/** "TH | EN" text switch — never flags; each option has its own lang (§6.20, OMX-024). */
export function LangSwitch() {
  const { t, i18n } = useTranslation();
  const setLanguage = useAppStore((st) => st.setLanguage);
  const announce = useUiStore((st) => st.announce);
  const current = i18n.language as Language;
  const choose = (lang: Language) => {
    if (lang === current) return;
    void i18n.changeLanguage(lang).then(() => {
      document.documentElement.lang = lang;
      announce(i18n.t('lang.changed'));
    });
    setLanguage(lang);
  };
  return (
    <div className={s.langSwitch} role="group" aria-label={t('lang.switchLabel')}>
      {(['th', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={s.langOption}
          aria-pressed={current === l}
          title={l === 'th' ? 'ไทย' : 'English'}
          onClick={() => choose(l)}
        >
          {l.toUpperCase()}
          {/* full name for screen readers; visible label stays part of the name (WCAG 2.5.3) */}
          <span className="omx-visually-hidden"> {l === 'th' ? 'ไทย' : 'English'}</span>
        </button>
      ))}
    </div>
  );
}
