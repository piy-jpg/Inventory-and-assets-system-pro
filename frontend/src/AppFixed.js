import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components to prevent blocking
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MobileDashboard = React.lazy(() => import('./components/MobileDashboard'));
const Layout = React.lazy(() => import('./components/Layout'));

// Suspense wrapper for lazy loading
const SuspenseWrapper = ({ children }) => (
  <React.Suspense fallback={
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <h2 style={{ margin: 0, color: '#374151' }}>Loading...</h2>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  }>
    {children}
  </React.Suspense>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{ margin: 0, color: '#374151' }}>Loading Smart Inventory System...</h2>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <SuspenseWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SuspenseWrapper>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SuspenseWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MobileDashboard />} />
          <Route path="/dashboard/desktop" element={<Layout><Dashboard /></Layout>} />
          
          {/* Core Routes - Lazy loaded */}
          <Route path="/inventory" element={<Layout>{React.lazy(() => import('./pages/Inventory'))}</Layout>} />
          <Route path="/transactions" element={<Layout>{React.lazy(() => import('./pages/Transactions'))}</Layout>} />
          <Route path="/suppliers" element={<Layout>{React.lazy(() => import('./pages/Suppliers'))}</Layout>} />
          <Route path="/customers" element={<Layout>{React.lazy(() => import('./pages/Customers'))}</Layout>} />
          <Route path="/analytics" element={<Layout>{React.lazy(() => import('./pages/Analytics'))}</Layout>} />
          <Route path="/settings" element={<Layout>{React.lazy(() => import('./pages/Settings'))}</Layout>} />
          
          {/* Fallback for all other routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SuspenseWrapper>
    </ErrorBoundary>
  );
}

export default App;
