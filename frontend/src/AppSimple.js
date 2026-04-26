import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import AppLoader from './components/AppLoader';
import Login from './pages/Login';
import MobileDashboard from './components/MobileDashboard';
import LoadingSpinner from './components/LoadingSpinner';

const AppSimple = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        
        {user ? (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<MobileDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </ErrorBoundary>
  );
};

export default AppSimple;
