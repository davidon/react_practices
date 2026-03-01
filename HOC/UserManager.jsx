import { useState } from 'react';

const UserManager = () => {
  // 1. Lazy Initialization: Read from storage ONLY on the first load
  const [user, setUser] = useState(() => {
    return localStorage.getItem("user") || "";
  });
  
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    // 2. Update the Browser's persistent storage
    localStorage.setItem("user", inputValue);
    
    // 3. Update React State so the UI changes immediately
    setUser(inputValue);
    
    // Clear the input
    setInputValue("");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser("");
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>User Management</h3>
      
      {user ? (
        <div>
          <p>Current User: <strong>{user}</strong></p>
          <button onClick={handleLogout}>Log Out / Clear Storage</button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            placeholder="Enter username..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button onClick={handleSave} style={{ marginLeft: '10px' }}>
            Save to LocalStorage
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManager;