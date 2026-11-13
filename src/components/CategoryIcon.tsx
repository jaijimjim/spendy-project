import {
  BriefcaseBusiness,
  Bus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  House,
  PiggyBank,
  ReceiptText,
  Send,
  Shapes,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from '../domain/types';
import { isIncomeCategory } from '../domain/categories';
import s from './ui.module.css';
import { cn } from './cn';

/** Category identity = icon + name, never colour alone (design-system §5.1). */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Bus,
  shopping: ShoppingBag,
  bills: ReceiptText,
  housing: House,
  health: HeartPulse,
  entertainment: Clapperboard,
  education: GraduationCap,
  transfer: Send,
  other: Shapes,
  salary: BriefcaseBusiness,
  other_income: PiggyBank,
};

export function CategoryChip({ id, size = 'md' }: { id: CategoryId; size?: 'md' | 'sm' }) {
  const Icon = CATEGORY_ICONS[id] ?? Shapes;
  return (
    <span
      className={cn(
        s.catChip,
        isIncomeCategory(id) && s.catChipIncome,
        size === 'sm' && s.catChipSm,
      )}
      aria-hidden="true"
    >
      <Icon size={size === 'sm' ? 18 : 20} />
    </span>
  );
}
