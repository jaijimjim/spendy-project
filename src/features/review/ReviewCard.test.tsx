/**
 * Review card — payee empty state D1 (OMX-049 AC6). Synthetic OCR text only (fake names).
 */
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { initI18n } from '../../i18n';
import { parseSlip } from '../../domain/slip/parseSlip';
import { draftFromParsed, useQueueStore, type QueueItem } from '../../store/queueStore';
import { ReviewCard } from './ReviewCard';

const TODAY = '2026-11-23';

function itemFrom(text: string): QueueItem {
  const parsed = parseSlip(text, TODAY);
  return {
    id: 'i1',
    name: 'slip.png',
    blob: new Blob(),
    url: '',
    hash: '',
    origin: 'upload',
    status: 'done',
    progress: 1,
    text,
    parsed,
    draft: draftFromParsed(parsed),
    selected: true,
    duplicate: null,
  };
}

function Harness() {
  const item = useQueueStore((s) => s.items[0]!);
  return (
    <ReviewCard
      item={item}
      index={1}
      total={1}
      expanded
      onToggle={() => undefined}
      showErrors={false}
      onOpenImage={() => undefined}
      onDiscard={() => undefined}
      onViewExisting={() => undefined}
    />
  );
}

function renderCard(text: string, lang: 'th' | 'en' = 'en') {
  initI18n(lang);
  act(() => useQueueStore.setState({ items: [itemFrom(text)] }));
  return render(<Harness />);
}

const NO_PAYEE = 'ชำระเงินสำเร็จ\n14 พ.ย. 69 10:00 น.\nจำนวน 50.00 บาท';
const ARROW =
  'โอนเงินสำเร็จ\n14 พ.ย. 69 10:00 น.\nXXX-X-X1234-X\n↓\nนาย สมมุติ ใจงาม\nXXX-X-X9876-X\nจำนวน 50.00 บาท';

describe('ReviewCard payee empty state (OMX-049 AC6 / D1)', () => {
  it('expense without payee: info helper linked by aria-describedby + placeholder + collapsed "No payee"', () => {
    renderCard(NO_PAYEE);
    const input = screen.getByLabelText(/Payee \/ source/);
    expect(input).toHaveAttribute('placeholder', 'e.g. noodle shop, employer');
    const helper = screen.getByText('No recipient found on the slip — tap to add');
    expect(input.getAttribute('aria-describedby')).toBe(helper.closest('p')!.id);
    expect(screen.getByTestId('review-payee-line')).toHaveTextContent('No payee');
    // Info style (helper), not the warning style; payee stays optional.
    expect(helper.closest('p')).toHaveClass('helper');
    expect(helper.closest('p')).not.toHaveClass('warnText');
  });

  it('helper disappears once the user types; collapsed line shows the typed payee', () => {
    renderCard(NO_PAYEE);
    const input = screen.getByLabelText(/Payee \/ source/);
    fireEvent.change(input, { target: { value: 'ร้านทดสอบ' } });
    expect(screen.queryByText('No recipient found on the slip — tap to add')).toBeNull();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.getByTestId('review-payee-line')).toHaveTextContent('ร้านทดสอบ');
  });

  it('payee found (arrow layout): no helper, collapsed line shows the payee', () => {
    renderCard(ARROW);
    expect(screen.getByLabelText(/Payee \/ source/)).toHaveValue('นาย สมมุติ ใจงาม');
    expect(screen.queryByText('No recipient found on the slip — tap to add')).toBeNull();
    expect(screen.getByTestId('review-payee-line')).toHaveTextContent('นาย สมมุติ ใจงาม');
  });

  it('salary slip: no payee helper (not an expense)', () => {
    renderCard('สลิปเงินเดือน\nเงินได้สุทธิ 1,000.00\nวันที่จ่าย 25/10/2569');
    expect(screen.queryByText('No recipient found on the slip — tap to add')).toBeNull();
  });

  it('Thai copy comes from the copy deck', () => {
    renderCard(NO_PAYEE, 'th');
    expect(screen.getByText('ไม่พบชื่อผู้รับในสลิป — แตะเพื่อกรอก')).toBeInTheDocument();
    expect(screen.getByTestId('review-payee-line')).toHaveTextContent('ไม่ระบุผู้รับ');
  });
});
