// Storage Manager Class
export class StorageManager {
    constructor() {
        this.tasksKey = 'taskmaster_tasks';
        this.categoriesKey = 'taskmaster_categories';
        this.settingsKey = 'taskmaster_settings';
    }

    // Get tasks from local storage
    getTasks() {
        const tasksJson = localStorage.getItem(this.tasksKey);
        return tasksJson ? JSON.parse(tasksJson) : [];
    }

    // Save tasks to local storage
    saveTasks(tasks) {
        localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    }

    // Get categories from local storage
    getCategories() {
        const categoriesJson = localStorage.getItem(this.categoriesKey);
        return categoriesJson ? JSON.parse(categoriesJson) : [
            { id: 'work', name: 'Work', color: '#4CAF50' },
            { id: 'personal', name: 'Personal', color: '#2196F3' },
            { id: 'urgent', name: 'Urgent', color: '#F44336' }
        ];
    }

    // Save categories to local storage
    saveCategories(categories) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    }

    // Get settings from local storage
    getSettings() {
        const settingsJson = localStorage.getItem(this.settingsKey);
        return settingsJson ? JSON.parse(settingsJson) : {
            darkMode: false,
            language: 'en',
            autoBackupFrequency: 'never',
            lastBackupDate: null
        };
    }

    // Save settings to local storage
    saveSettings(settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    }

    // Clear all data from local storage
    clearAllData() {
        localStorage.removeItem(this.tasksKey);
        localStorage.removeItem(this.categoriesKey);
        localStorage.removeItem(this.settingsKey);
    }

    // Export all data as JSON
    exportData() {
        const data = {
            tasks: this.getTasks(),
            categories: this.getCategories(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    // Import data from JSON
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
                // Keep current language setting
                const currentSettings = this.getSettings();
                data.settings.language = currentSettings.language;
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}