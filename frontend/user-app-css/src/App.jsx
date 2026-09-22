import React, { useState } from 'react';
import Signup from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CategoriesPage from './components/CategoriesPage';
import ProductManager from './components/ProductManager';
import Analytics from './components/Analytics';

function App() {
  // Navigation & Auth State
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'signup' | 'dashboard'
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'analytics'
  const [currentUser, setCurrentUser] = useState(null);

  // App Selection Context State
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Auth Handlers
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentScreen('dashboard');
    setActiveTab('stores');
  };

  const handleSignupSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStore(null);
    setSelectedCategory(null);
    setActiveTab('stores');
    setCurrentScreen('login');
  };

  // Selection Handlers
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setSelectedCategory(null);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  // 1. Render Login View
  if (currentScreen === 'login') {
    return (
      <div style={styles.authWrapper}>
        <Login
          onLoginSuccess={handleLoginSuccess}
          switchToSignup={() => setCurrentScreen('signup')}
        />
      </div>
    );
  }

  // 2. Render Signup View
  if (currentScreen === 'signup') {
    return (
      <div style={styles.authWrapper}>
        <Signup
          onSignupSuccess={handleSignupSuccess}
          switchToLogin={() => setCurrentScreen('login')}
        />
      </div>
    );
  }

  // Helper to extract clean category display string
  const categoryDisplayName =
    typeof selectedCategory === 'object' ? selectedCategory?.name : selectedCategory;

  // 3. Render Dashboard View Flow
  return (
    <div style={styles.appContainer}>
      {/* Global Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.logo}>📦</span> Stockline
        </div>

        {/* View Switcher Tabs */}
        <div style={styles.navTabs}>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'stores' ? styles.activeTabBtn : {}),
            }}
          >
            Stores
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'analytics' ? styles.activeTabBtn : {}),
            }}
          >
            Analytics
          </button>
        </div>

        {/* Breadcrumb Navigation Trail (Visible under 'stores' tab) */}
        {activeTab === 'stores' && (
          <div style={styles.breadcrumbs}>
            <span
              onClick={handleBackToStores}
              style={selectedStore ? styles.breadcrumbLink : styles.breadcrumbActive}
            >
              Stores
            </span>

            {selectedStore && (
              <>
                <span style={styles.separator}>/</span>
                <span
                  onClick={handleBackToCategories}
                  style={selectedCategory ? styles.breadcrumbLink : styles.breadcrumbActive}
                >
                  {selectedStore.name}
                </span>
              </>
            )}

            {selectedCategory && (
              <>
                <span style={styles.separator}>/</span>
                <span style={styles.breadcrumbActive}>{categoryDisplayName}</span>
              </>
            )}
          </div>
        )}

        <div style={styles.userSection}>
          {currentUser && (
            <span style={styles.welcomeText}>
              Welcome, {currentUser.name || currentUser.email}!
            </span>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {/* Dynamic Screen View Router */}
      <main style={styles.mainContent}>
        {activeTab === 'analytics' ? (
          <Analytics />
        ) : (
          <>
            {!selectedStore && <Dashboard onSelectStore={handleSelectStore} />}

            {selectedStore && !selectedCategory && (
              <CategoriesPage
                selectedStore={selectedStore}
                onSelectCategory={handleSelectCategory}
                onBack={handleBackToStores}
              />
            )}

            {selectedStore && selectedCategory && (
              <ProductManager
                store={selectedStore}
                category={selectedCategory}
                userRole={storedUser?.role}
                onBack={handleBackToCategories}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  authWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  navBrand: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0F2F52',
  },
  logo: {
    fontSize: '1.4rem',
  },
  navTabs: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#F0F4F8',
    padding: '4px',
    borderRadius: '6px',
  },
  tabBtn: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#5C6B7A',
    fontWeight: '500',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    color: '#1D4E89',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    color: '#6c757d',
  },
  breadcrumbLink: {
    color: '#1D4E89',
    cursor: 'pointer',
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontWeight: 'bold',
    color: '#212529',
  },
  separator: {
    color: '#adb5bd',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#fff',
    border: '1px solid #ff4d4f',
    color: '#ff4d4f',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

export default App;