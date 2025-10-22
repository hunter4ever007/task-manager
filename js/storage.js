
// Storage module for handling data persistence
class Storage {
  constructor() {
    this.keys = {
      tasks: 'tasks',
      categories: 'categories',
      settings: 'settings',
      lastBackup: 'lastBackup'
    };
  }

  getTasks() {
    const tasks = localStorage.getItem(this.keys.tasks);
    return tasks ? JSON.parse(tasks) : [];
  }

  saveTasks(tasks) {
    localStorage.setItem(this.keys.tasks, JSON.stringify(tasks));
  }

  getCategories() {
    const categories = localStorage.getItem(this.keys.categories);
    return categories ? JSON.parse(categories) : [
      { id: 'work', name: 'Work', color: '#4285f4' },
      { id: 'personal', name: 'Personal', color: '#0f9d58' },
      { id: 'urgent', name: 'Urgent', color: '#db4437' }
    ];
  }

  saveCategories(categories) {
    localStorage.setItem(this.keys.categories, JSON.stringify(categories));
  }

  getSettings() {
    const settings = localStorage.getItem(this.keys.settings);
    return settings ? JSON.parse(settings) : {
      theme: 'light',
      language: 'en',
      notifications: {
        enabled: false,
        sound: true
      },
      backup: {
        auto: false,
        frequency: 'weekly'
      }
    };
  }

  saveSettings(settings) {
    localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  getLastBackup() {
    return localStorage.getItem(this.keys.lastBackup);
  }

  setLastBackup(date) {
    localStorage.setItem(this.keys.lastBackup, date);
  }

  exportData() {
    const data = {
      tasks: this.getTasks(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (data.tasks) {
        this.saveTasks(data.tasks);
      }

      if (data.categories) {
        this.saveCategories(data.categories);
      }

      if (data.settings) {
        this.saveSettings(data.settings);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAll() {
    localStorage.removeItem(this.keys.tasks);
    localStorage.removeItem(this.keys.categories);
    localStorage.removeItem(this.keys.settings);
    localStorage.removeItem(this.keys.lastBackup);
  }
}

// Initialize storage
const storage = new Storage();
