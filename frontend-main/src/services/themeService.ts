type Theme = 'light' | 'dark';

/**
 * Service for managing application theme (light/dark mode).
 */
class ThemeService {
  private theme: Theme = 'light';

  /**
   * Gets the current theme.
   * @returns The current theme ('light' or 'dark')
   */
  getTheme(): Theme {
    return this.theme;
  }

  /**
   * Sets the application theme and persists it to localStorage.
   * @param theme - The theme to set ('light' or 'dark')
   */
  setTheme(theme: Theme) {
    this.theme = theme;
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  init() {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      this.setTheme(saved);
    }
  }

  get isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  getAvailableThemes(): string[] {
    return ['light', 'dark'];
  }
}

export const themeService = new ThemeService();