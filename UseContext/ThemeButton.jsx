import { useTheme } from './ThemeContext.jsx';

const btnBase = {
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  border: '1px solid #999',
  fontSize: 12,
};

/**
 * ThemeButton — lets the user switch between dark / light / grey
 * for THIS card only.
 *
 * KEY CONCEPT: Scoped context mutation.
 *   setSpecificTheme() updates the state in THIS card's ThemeProvider.
 *   Because each card has its own ThemeProvider instance, calling
 *   setSpecificTheme('dark') here does NOT affect other cards — only
 *   components under this ThemeProvider re-render with the new theme.
 */
export default function ThemeButton() {
  // KEY: Destructure only what this component needs from context.
  //   This is a best practice — if the context had other fields,
  //   this component wouldn't re-render when those other fields change.
  const { theme, setSpecificTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
      {['dark', 'light', 'grey'].map((t) => (
        <button
          key={t}
          onClick={() => setSpecificTheme(t)}
          style={{
            ...btnBase,
            fontWeight: theme === t ? 'bold' : 'normal',
            background: theme === t ? '#4a90d9' : 'transparent',
            color: theme === t ? '#fff' : 'inherit',
          }}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
