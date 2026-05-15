import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.state';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoginPage } from '@/pages/Login';
import { OverviewPage } from '@/pages/Overview';
import { RegexEnginePage } from '@/pages/RegexEngine';
import { IngestionPage } from '@/pages/Ingestion';
import { TransactionsPage } from '@/pages/Transactions';
import { UsersPage } from '@/pages/Users';
import { AIUsagePage } from '@/pages/AIUsage';

function Shell() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <div className="content-inner">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/regex" element={<RegexEnginePage />} />
            <Route path="/ingestion" element={<IngestionPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/ai" element={<AIUsagePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={token ? <Shell /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
