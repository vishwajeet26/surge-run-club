import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import RunsPage from './pages/RunsPage';
import MyCardPage from './pages/MyCardPage';
import AdminRecordsPage from './pages/AdminRecordsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('runs');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === 'runs' && (
          <RunsPage
            onGoToRegister={() => setActiveTab('register')}
            onGoToLogin={() => setActiveTab('login')}
          />
        )}

        {activeTab === 'my-card' && (
          <MyCardPage onGoToRuns={() => setActiveTab('runs')} />
        )}

        {activeTab === 'records' && (
          <AdminRecordsPage />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onLoggedIn={() => setActiveTab('my-card')}
            onGoToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onRegistered={() => setActiveTab('my-card')}
            onGoToLogin={() => setActiveTab('login')}
          />
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '13px',
        background: 'var(--panel)',
        marginTop: '60px'
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--fg)', font: '800 16px var(--display)', letterSpacing: '0.04em' }}>
              SURGE RUN CLUB
            </strong>{' '}
            • EST. 2026 • EVERY RUN COUNTS
          </div>
          <div>
            Backend: <span style={{ color: 'var(--arc-lite)' }}>Python FastAPI + SQLite</span> • Frontend: <span style={{ color: 'var(--amber)' }}>React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
