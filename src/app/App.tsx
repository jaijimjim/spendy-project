import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { TransactionFormPage } from '../features/transactions/TransactionFormPage';
import { AddSlipPage } from '../features/add/AddSlipPage';
import { ReviewPage } from '../features/review/ReviewPage';
import { SettingsPage } from '../features/settings/SettingsPage';

/** HashRouter — GitHub Pages has no SPA fallback, so deep links use #/… (OMX-025 AC4). */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transactions/new', element: <TransactionFormPage /> },
      { path: 'transactions/:id', element: <TransactionFormPage /> },
      { path: 'add', element: <AddSlipPage /> },
      { path: 'add/review', element: <ReviewPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
