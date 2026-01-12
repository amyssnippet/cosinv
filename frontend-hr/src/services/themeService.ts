type Theme = 'light' | 'dark';

/**
 * Service for managing theme settings in HR portal (light/dark mode).
 */
class ThemeService {
  private theme: Theme = 'light';

  getTheme(): Theme {
    return this.theme;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    document.documentElement.className = theme;
    localStorage.setItem('hr-theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  init() {
    const saved = localStorage.getItem('hr-theme') as Theme;
    if (saved) {
      this.setTheme(saved);
    }
  }
}

export const themeService = new ThemeService();