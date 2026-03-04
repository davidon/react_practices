import { UserProvider } from './UserContext.jsx';
import ThemeButton from './ThemeButton.jsx';

export default function App() {
  return (
    <UserProvider>
      <div className="app-container">
        <h1>Welcome to the App</h1>
        <ThemeButton />
      </div>
    </UserProvider>
  );
}