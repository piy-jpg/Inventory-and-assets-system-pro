import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const AppLoader = () => {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      setStatus('loading');
      setError(null);
    } else if (user) {
      setStatus('authenticated');
      setError(null);
    } else {
      setStatus('unauthenticated');
      setError(null);
    }
  }, [user, loading]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <h2 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>Loading Smart Inventory System...</h2>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Please wait while we prepare your dashboard</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#dc2626', fontSize: '18px' }}>Loading Error</h2>
          <p style={{ margin: '0 0 16px 0', color: '#7f1d1d', fontSize: '14px' }}>
            {error || 'An unexpected error occurred while loading the application.'}
          </p>
          <button
            onClick={handleRetry}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null; // Let the main app handle rendering
};

export default AppLoader;
