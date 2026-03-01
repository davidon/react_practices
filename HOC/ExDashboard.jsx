// --- OUTSIDE THE APP COMPONENT ---

// 1. Your original UI component
const Dashboard = ({ userRole }) => <div>Welcome, {userRole}</div>;

// 2. Your HOC definition
const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = localStorage.getItem("user");
    if (!isAuthenticated) return <div>Please Log In</div>;
    
    // We use the placeholder name from the function argument above
    return <WrappedComponent {...props} />;
  };
};

// 3. Create the "Enhanced" version ONCE
// This 'ExDashboard' is now a real React Component!
const ExDashboard = withAuth(Dashboard);

// --- THE APP COMPONENT ---

function App() {
  return (
    <div className="App">
      <h1>My Secure App</h1>
      
      {/* 4. Use the enhanced version just like a normal component */}
      <ExDashboard userRole="Administrator" />
    </div>
  );
}

// --- main.jsx ---
import React from 'react';
import ReactDOM from 'react-dom/client';

import UserManager from './UserManager.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />

    <UserManager />
  </React.StrictMode>
);
