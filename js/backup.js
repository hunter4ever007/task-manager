
// Backup module
class Backup {
  constructor() {
    this.autoBackupInterval = null;
    this.init();
  }

  init() {
    // Load backup settings
    this.loadSettings();

    // Start auto backup if enabled
    if (this.settings.auto) {
      this.startAutoBackup();
    }
  }

  loadSettings() {
    this.settings = storage.getSettings().backup;
    this.lastBackup = storage.getLastBackup();
  }

  updateSettings(auto, frequency) {
    this.settings = { auto, frequency };

    // Save to storage
    const settings = storage.getSettings();
    settings.backup = this.settings;
    storage.saveSettings(settings);

    // Restart auto backup with new settings
    if (auto) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  startAutoBackup() {
    // Clear any existing interval
    this.stopAutoBackup();

    // Calculate interval in milliseconds
    let intervalMs;
    switch (this.settings.frequency) {
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        intervalMs = 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }

    // Set up interval
    this.autoBackupInterval = setInterval(() => {
      this.createBackup();
    }, intervalMs);
  }

  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  createBackup() {
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);

      // Update last backup date
      const now = new Date().toISOString();
      storage.setLastBackup(now);
      this.lastBackup = now;

      // Update UI
      this.updateBackupInfo();

      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  restoreBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonData = event.target.result;
          const success = storage.importData(jsonData);

          if (success) {
            // Update last backup date
            const now = new Date().toISOString();
            storage.setLastBackup(now);
            this.lastBackup = now;

            // Update UI
            this.updateBackupInfo();

            resolve(true);
          } else {
            reject(new Error('Failed to import data'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  updateBackupInfo() {
    const lastBackupElement = document.getElementById('last-backup-date');
    if (lastBackupElement) {
      if (this.lastBackup) {
        const date = new Date(this.lastBackup);
        lastBackupElement.textContent = date.toLocaleDateString();
      } else {
        lastBackupElement.textContent = 'Never';
      }
    }
  }
}

// Initialize backup
const backup = new Backup();
