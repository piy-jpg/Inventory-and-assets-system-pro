import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Simple stable login component
const SimpleLogin = () => {
  const [loginData, setLoginData] = useState({ username: 'jaanu@1', password: '123456' });
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login
    localStorage.setItem('mockUser', JSON.stringify({
      username: loginData.username,
      email: 'jaanu@example.com',
      role: 'admin'
    }));
    localStorage.setItem('mockToken', 'mock-token-' + Date.now());
    window.location.href = '/dashboard';
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, sans-serif'
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
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151' }}>
              Username
            </label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
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
        </form>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          Demo credentials: jaanu@1 / 123456
        </div>
      </div>
    </div>
  );
};

// Simple stable dashboard component
const SimpleDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const userData = localStorage.getItem('mockUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockToken');
    window.location.href = '/login';
  };
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
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
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '20px' }}>
            Smart Inventory Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Welcome back, {user?.username || 'User'}!
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Items</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>10</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Low Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>2</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>$7,699</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Profit</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>$3,200</div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => alert('Add Product feature coming soon!')}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + Add Product
            </button>
            <button
              onClick={() => alert('New Sale feature coming soon!')}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              New Sale
            </button>
            <button
              onClick={() => alert('View Inventory feature coming soon!')}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              View Inventory
            </button>
            <button
              onClick={() => alert('Reports feature coming soon!')}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Reports
            </button>
          </div>
        </div>
        
        {/* Recent Items */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Recent Inventory Items
          </h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {[
              { name: 'Laptop Pro 15"', quantity: 25, price: '$1,299', category: 'Electronics' },
              { name: 'Wireless Mouse', quantity: 150, price: '$29', category: 'Computer Hardware' },
              { name: 'Office Chair', quantity: 35, price: '$199', category: 'Furniture' },
              { name: 'Monitor 27"', quantity: 40, price: '$399', category: 'Electronics' },
              { name: 'Smartphone X', quantity: 80, price: '$899', category: 'Mobile Devices' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'medium', color: '#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {item.category} · Stock: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const AppStable = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('mockToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
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
  
  return (
    <Routes>
      <Route path="/login" element={<SimpleLogin />} />
      <Route path="/register" element={<SimpleLogin />} />
      
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<SimpleDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AppStable;
