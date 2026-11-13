import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LangSwitch } from '../components/LangSwitch';
import s from './shell.module.css';

/** Screen title (h1, focus target on route change) + document.title (design-system §7.1). */
export function PageHeader({
  title,
  lead,
  trailing,
  showLang = true,
}: {
  title: string;
  lead?: ReactNode;
  trailing?: ReactNode;
  showLang?: boolean;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t('app.titleTemplate', { screen: title });
  }, [t, title]);
  return (
    <header className={s.pageHeader}>
      <div className={s.pageHeaderLead}>
        {lead}
        <h1 className={s.h1} tabIndex={-1} data-page-title>
          {title}
        </h1>
      </div>
      <div className={s.pageHeaderLead}>
        {trailing}
        {showLang && (
          <span className={s.hideDesktop}>
            <LangSwitch />
          </span>
        )}
      </div>
    </header>
  );
}
