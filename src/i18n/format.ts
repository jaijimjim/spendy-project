/** Locale-aware formatting hooks (dates in BE for Thai, THB amounts). */
import { useTranslation } from 'react-i18next';
import { formatDateShort, formatMonthLong, formatMonthShort } from '../domain/date';
import { formatSatang, formatSigned } from '../domain/money';
import type { Language, Transaction } from '../domain/types';

export function useLang(): Language {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? 'en' : 'th';
}

export function useFormat() {
  const lang = useLang();
  const locale = lang === 'th' ? 'th-TH' : 'en-US';
  return {
    lang,
    money: (satang: number) => formatSatang(satang, locale),
    signed: (satang: number) => formatSigned(satang, locale),
    txSigned: (t: Pick<Transaction, 'type' | 'amountSatang'>) =>
      formatSigned(t.type === 'income' ? t.amountSatang : -t.amountSatang, locale),
    date: (ymd: string) => formatDateShort(ymd, lang),
    month: (ym: string) => formatMonthLong(ym, lang),
    monthShort: (ym: string) => formatMonthShort(ym, lang),
  };
}
