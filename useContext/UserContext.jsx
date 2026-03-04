import { createContext, useContext, useState } from 'react';

// 1. Create the Context object
const UserContext = createContext(undefined);

// 2. The Provider Component
export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "Alex",
    theme: "dark"
  });

  const toggleTheme = () => {
    setUser(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  // We pass an object as the 'value'
  return (
    <UserContext.Provider value={{ user, toggleTheme }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. The Custom Hook with Error Handling
export function useUser() {
  const context = useContext(UserContext);
  
  // If context is undefined, it means this hook was called 
  // outside of a <UserProvider>
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  
  return context;
}