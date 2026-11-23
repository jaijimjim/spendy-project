import { payeeCer, payeeMatches, payeeReport } from './payeeMetrics';

describe('payee metrics (OMX-051)', () => {
  it('matches after normalizePayee (prefix, spaces, dots, case, SARA AM)', () => {
    expect(payeeMatches('น.ส. สมใจ ใจดี', 'น.ส.สมใจ ใจดี')).toBe(true);
    expect(payeeMatches('นาย ชัยพร ดําเนิน', 'นายชัยพร ดำเนิน')).toBe(true);
    expect(payeeMatches('GRAB', 'Grab')).toBe(true);
    expect(payeeMatches('GrabFood', 'Grab')).toBe(false);
  });

  it('accepts alternatives and treats expected null as "must be empty"', () => {
    expect(payeeMatches('ร้าน ก', 'ร้าน ข', ['ร้าน ก'])).toBe(true);
    expect(payeeMatches(null, null)).toBe(true);
    expect(payeeMatches('', null)).toBe(true);
    expect(payeeMatches('ใครสักคน', null)).toBe(false);
    expect(payeeMatches(null, 'ร้าน ก')).toBe(false);
  });

  it('computes CER on normalized text', () => {
    expect(payeeCer('GrabFood', 'GrabFood')).toBe(0);
    expect(payeeCer(null, 'abcd')).toBe(1);
    expect(payeeCer('abce', 'abcd')).toBe(0.25);
    expect(payeeCer('x', '')).toBe(1);
    expect(payeeCer(null, '')).toBe(0);
  });

  it('reports exact % and mean CER', () => {
    const r = payeeReport([
      { actual: 'abcd', expected: 'abcd' },
      { actual: null, expected: 'abcd' },
      { actual: null, expected: null },
    ]);
    expect(r).toEqual({ n: 3, exact: 2, exactPct: 66.7, meanCer: 0.5 });
    expect(payeeReport([])).toEqual({ n: 0, exact: 0, exactPct: 0, meanCer: 0 });
  });
});
