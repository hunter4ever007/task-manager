// Import modules
import { TaskManager } from './task-manager.js';
import { UIManager } from './ui-manager.js';
import { StorageManager } from './storage-manager.js';
import { NotificationManager } from './notification-manager.js';
import { CalendarManager } from './calendar-manager.js';
import { BackupManager } from './backup-manager.js';
import { LanguageManager } from './language-manager.js';

// Main App Class
class App {
    constructor() {
        // Initialize managers
        this.storageManager = new StorageManager();
        this.taskManager = new TaskManager(this.storageManager);
        this.uiManager = new UIManager(this);
        this.notificationManager = new NotificationManager(this);
        this.calendarManager = new CalendarManager(this);
        this.backupManager = new BackupManager(this);
        this.languageManager = new LanguageManager(this);
        
        // Initialize the app
        this.init();
    }

    init() {
        // Load data from storage
        this.loadData();
        
        // Initialize UI
        this.uiManager.initUI();
        
        // Initialize calendar
        this.calendarManager.initCalendar();
        
        // Check for notifications
        this.notificationManager.checkNotifications();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for auto backup
        this.backupManager.checkAutoBackup();
    }

    loadData() {
        // Load tasks
        const tasks = this.storageManager.getTasks();
        this.taskManager.setTasks(tasks);
        
        // Load categories
        const categories = this.storageManager.getCategories();
        this.taskManager.setCategories(categories);
        
        // Load settings
        const settings = this.storageManager.getSettings();
        this.applySettings(settings);
    }

    applySettings(settings) {
        // Apply theme
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').checked = true;
            if (document.getElementById('mobile-theme-toggle')) {
                document.getElementById('mobile-theme-toggle').checked = true;
            }
        }
        
        // Apply language
        if (settings.language === 'ar') {
            this.languageManager.setLanguage('ar');
        }
        
        // Apply auto backup settings
        if (settings.autoBackupFrequency) {
            document.getElementById('auto-backup-frequency').value = settings.autoBackupFrequency;
        }
        
        // Update last backup date display
        if (settings.lastBackupDate) {
            document.getElementById('last-backup-date').textContent = new Date(settings.lastBackupDate).toLocaleString();
            if (document.getElementById('mobile-last-backup-date')) {
                document.getElementById('mobile-last-backup-date').textContent = new Date(settings.lastBackupDate).toLocaleString();
            }
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('change', () => {
            this.toggleTheme();
        });
        
        if (document.getElementById('mobile-theme-toggle')) {
            document.getElementById('mobile-theme-toggle').addEventListener('change', () => {
                this.toggleTheme();
            });
        }
        
        // Language toggle
        document.getElementById('en-lang').addEventListener('click', () => {
            this.languageManager.setLanguage('en');
        });
        
        document.getElementById('ar-lang').addEventListener('click', () => {
            this.languageManager.setLanguage('ar');
        });
        
        if (document.getElementById('mobile-en-lang')) {
            document.getElementById('mobile-en-lang').addEventListener('click', () => {
                this.languageManager.setLanguage('en');
            });
        }
        
        if (document.getElementById('mobile-ar-lang')) {
            document.getElementById('mobile-ar-lang').addEventListener('click', () => {
                this.languageManager.setLanguage('ar');
            });
        }
        
        // Sidebar toggle (mobile)
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });
        
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.uiManager.showTaskModal();
        });
        
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.uiManager.showCategoryModal();
        });
        
        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uiManager.handleTaskFormSubmit();
        });
        
        // Category form submission
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uiManager.handleCategoryFormSubmit();
        });
        
        // Close modals
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(element => {
            element.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('show');
                });
            });
        });
        
        // Search input
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.uiManager.handleSearch(e.target.value);
        });
        
        // Sort and filter
        document.getElementById('sort-select').addEventListener('change', () => {
            this.uiManager.renderTasks();
        });
        
        document.getElementById('filter-select').addEventListener('change', () => {
            this.uiManager.renderTasks();
        });
        
        // View navigation
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.uiManager.changeView(view);
            });
        });
        
        // Mobile navigation
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                if (view === 'add') {
                    this.uiManager.showTaskModal();
                } else if (view === 'settings') {
                    document.getElementById('settings-modal').classList.add('show');
                } else {
                    this.uiManager.changeView(view);
                }
            });
        });
        
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendarManager.prevMonth();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.calendarManager.nextMonth();
        });
        
        // Backup and restore
        document.getElementById('backup-btn').addEventListener('click', () => {
            this.backupManager.backupData();
        });
        
        document.getElementById('restore-btn').addEventListener('click', () => {
            document.getElementById('restore-file-input').click();
        });
        
        if (document.getElementById('mobile-backup-btn')) {
            document.getElementById('mobile-backup-btn').addEventListener('click', () => {
                this.backupManager.backupData();
            });
        }
        
        if (document.getElementById('mobile-restore-btn')) {
            document.getElementById('mobile-restore-btn').addEventListener('click', () => {
                document.getElementById('restore-file-input').click();
            });
        }
        
        document.getElementById('restore-file-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.backupManager.restoreData(e.target.files[0]);
            }
        });
        
        // Auto backup frequency
        document.getElementById('auto-backup-frequency').addEventListener('change', (e) => {
            this.backupManager.setAutoBackupFrequency(e.target.value);
        });
        
        // Notification toggle
        document.getElementById('task-notification').addEventListener('change', (e) => {
            document.getElementById('notification-time').disabled = !e.target.checked;
        });
        
        // Notification close
        document.getElementById('notification-close').addEventListener('click', () => {
            document.getElementById('notification-modal').classList.remove('show');
        });
    }

    toggleTheme() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        
        // Sync theme toggles
        document.getElementById('theme-toggle').checked = isDarkMode;
        if (document.getElementById('mobile-theme-toggle')) {
            document.getElementById('mobile-theme-toggle').checked = isDarkMode;
        }
        
        // Save theme preference
        const settings = this.storageManager.getSettings();
        settings.darkMode = isDarkMode;
        this.storageManager.saveSettings(settings);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
});