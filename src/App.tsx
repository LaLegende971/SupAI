import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/shared/Sidebar';
import { AgentsPage } from './pages/AgentsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { GroupsPage } from './pages/GroupsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-bg-primary">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-bg-primary">
          <Routes>
            <Route path="/" element={<Navigate to="/agents" replace />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/enrollment" element={<EnrollmentPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
