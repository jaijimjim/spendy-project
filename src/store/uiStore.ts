/** Ephemeral UI state: selected month (not persisted — OMX-017 AC1), filters, toast, live announcements. */
import { create } from 'zustand';
import { currentMonth } from '../services/clock';
import { EMPTY_FILTERS, type Filters } from '../domain/transactions';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onAction: () => void };
}

interface UiState {
  selectedMonth: string;
  filters: Filters;
  toast: Toast | null;
  announcement: { id: number; text: string };
  addSheetOpen: boolean;
  setMonth(ym: string): void;
  setFilters(f: Filters): void;
  showToast(t: Omit<Toast, 'id'>): void;
  hideToast(id?: number): void;
  announce(text: string): void;
  setAddSheetOpen(open: boolean): void;
}

let seq = 0;

export const useUiStore = create<UiState>((set, get) => ({
  selectedMonth: currentMonth(),
  filters: EMPTY_FILTERS,
  toast: null,
  announcement: { id: 0, text: '' },
  addSheetOpen: false,
  setMonth: (selectedMonth) => set({ selectedMonth }),
  setFilters: (filters) => set({ filters }),
  showToast: (t) => set({ toast: { ...t, id: ++seq } }),
  hideToast: (id) => {
    if (id === undefined || get().toast?.id === id) set({ toast: null });
  },
  announce: (text) => set({ announcement: { id: ++seq, text } }),
  setAddSheetOpen: (addSheetOpen) => set({ addSheetOpen }),
}));
