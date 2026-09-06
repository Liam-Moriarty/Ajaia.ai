import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 4.5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1.5a1 1 0 0 1-1 1Zm0 15a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1ZM4.5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1Zm15 0a1 1 0 0 1 1-1H22a1 1 0 1 1 0 2h-1.5a1 1 0 0 1-1-1ZM6.34 6.34a1 1 0 0 1-1.42 0L3.87 5.29a1 1 0 1 1 1.42-1.42l1.05 1.05a1 1 0 0 1 0 1.42Zm12.02 12.02a1 1 0 0 1-1.41 0l-1.05-1.05a1 1 0 0 1 1.41-1.41l1.05 1.05a1 1 0 0 1 0 1.41ZM6.34 17.66a1 1 0 0 1 0 1.41l-1.05 1.05a1 1 0 0 1-1.42-1.41l1.05-1.05a1 1 0 0 1 1.42 0Zm12.02-12.02a1 1 0 0 1 0 1.42l-1.05 1.05a1 1 0 1 1-1.41-1.42l1.05-1.05a1 1 0 0 1 1.41 0ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.7 14.9a8.5 8.5 0 0 1-11-11.4.75.75 0 0 0-.96-.98A10 10 0 1 0 21.7 15.9a.75.75 0 0 0-1-.99Z"
          />
        </svg>
      )}
    </button>
  );
}
