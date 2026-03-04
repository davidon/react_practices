import { createContext, useContext, useState, useEffect } from 'react';

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

  // Apply the current theme as a class on the document root so
  // the entire page (outside component tree) reflects the theme.
  useEffect(() => {
    const root = document.documentElement;
    // remove any previous theme classes we might have added
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${user.theme}-mode`);

    return () => {
      root.classList.remove('light-mode', 'dark-mode');
    };
  }, [user.theme]);

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