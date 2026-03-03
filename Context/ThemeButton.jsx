import { useUser } from './UserContext.jsx';

function ThemeButton() {
  // Grab exactly what we need from our custom hook
  const { user, toggleTheme } = useUser();

  return (
    <div style={{ 
      background: user.theme === 'dark' ? '#333' : '#FFF',
      color: user.theme === 'dark' ? '#FFF' : '#333',
      padding: '20px' 
    }}>
      <p>Current User: {user.name}</p>
      <button onClick={toggleTheme}>
        Switch to {user.theme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}

export default ThemeButton;