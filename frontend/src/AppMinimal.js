import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const AppMinimal = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif'
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
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Routes>
        <Route path="/login" element={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f3f4f6'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '400px'
            }}>
              <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
                Smart Inventory System
              </h1>
              <p style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
                Login to access your inventory management system
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151' }}>
                  Username
                </label>
                <input
                  type="text"
                  defaultValue="jaanu@1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="123456"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                onClick={() => {
                  // Mock login - set user in localStorage
                  localStorage.setItem('mockUser', JSON.stringify({
                    username: 'jaanu@1',
                    email: 'jaanu@example.com',
                    role: 'admin'
                  }));
                  localStorage.setItem('mockToken', 'mock-token-' + Date.now());
                  window.location.href = '/dashboard';
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Sign In
              </button>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Demo credentials: jaanu@1 / 123456
              </div>
            </div>
          </div>
        } />
        
        <Route path="/dashboard" element={
          <div style={{
            padding: '20px',
            backgroundColor: '#f3f4f6',
            minHeight: '100vh'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h1 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
                Smart Inventory Dashboard
              </h1>
              <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                Welcome to your inventory management system!
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: '#eff6ff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Total Items</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>10</p>
                </div>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Low Stock</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>2</p>
                </div>
                <div style={{
                  backgroundColor: '#fefce8',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #fde047'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#713f12' }}>Revenue</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#713f12' }}>$7,699</p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => alert('Inventory page coming soon!')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Inventory
                </button>
                <button
                  onClick={() => alert('Transactions page coming soon!')}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Transactions
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('mockUser');
                    localStorage.removeItem('mockToken');
                    window.location.href = '/login';
                  }}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default AppMinimal;
