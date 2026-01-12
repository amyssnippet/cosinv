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
}

export const themeService = new ThemeService();