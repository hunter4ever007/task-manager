
this.settings.notifications.enabled;
    document.getElementById('notification-sound').checked = this.settings.notifications.sound;

    // Set backup settings
    document.getElementById('auto-backup').checked = this.settings.backup.auto;
    document.getElementById('backup-frequency').value = this.settings.backup.frequency;
  }

  toggleTheme() {
    const newTheme = this.settings.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    storage.saveSettings(this.settings);

    // Update icon
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
  }

  toggleLanguage() {
    const newLang = this.settings.language === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  setLanguage(lang) {
    this.settings.language = lang;
    i18n.setLanguage(lang);
    storage.saveSettings(this.settings);

    // Update language toggle
    document.getElementById('lang-text').textContent = lang === 'en' ? '🇺🇸' : '🇸🇦';
  }

  restoreBackup(file) {
    if (!file) return;

    backup.restoreBackup(file)
      .then(() => {
        // Reload data
        this.tasks = storage.getTasks();
        this.categories = storage.getCategories();
        this.settings = storage.getSettings();

        // Update UI
        this.setLanguage(this.settings.language);
        this.setTheme(this.settings.theme);
        this.renderView(this.currentView);

        this.showToast('Data restored successfully');
      })
      .catch(error => {
        console.error('Error restoring backup:', error);
        this.showToast('Failed to restore backup');
      });
  }

  updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(this.settings.language === 'ar' ? 'ar-SA' : 'en-US', options);

    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = formattedDate;
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(this.settings.language === 'ar' ? 'ar-SA' : 'en-US', options);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // Set message
    toastMessage.textContent = message;

    // Set icon based on type
    switch (type) {
      case 'success':
        toastIcon.textContent = 'check_circle';
        break;
      case 'error':
        toastIcon.textContent = 'error';
        break;
      case 'warning':
        toastIcon.textContent = 'warning';
        break;
      default:
        toastIcon.textContent = 'info';
    }

    // Show toast
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskManager();
  app.init();
});
