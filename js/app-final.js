
modal) {
      document.body.removeChild(modal);
    });

    // Add task event listeners
    dayTasks.forEach(task => {
      const taskElement = modal.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        const editBtn = taskElement.querySelector('.edit-task-btn');
        const deleteBtn = taskElement.querySelector('.delete-task-btn');
        const checkbox = taskElement.querySelector('.task-checkbox');

        if (editBtn) {
          editBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.editTask(task.id);
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.deleteTask(task.id);
          });
        }

        if (checkbox) {
          checkbox.addEventListener('change', () => {
            this.toggleTaskComplete(task.id);
            document.body.removeChild(modal);
            this.showDayTasks(dateStr);
          });
        }
      }
    });
  }

  createDayTaskHTML(task) {
    const category = this.categories.find(c => c.id === task.category);
    const categoryClass = category ? `category-${category.id}` : '';

    return `
      <div class="day-task ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="day-task-header">
          <span class="task-category ${categoryClass}">${category ? category.name : 'Uncategorized'}</span>
          <div class="task-actions">
            <button class="task-action-btn edit-task-btn">
              <i class="material-icons">edit</i>
            </button>
            <button class="task-action-btn delete-task-btn">
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
        <h4 class="day-task-title">${task.title}</h4>
        ${task.description ? `<p class="day-task-description">${task.description}</p>` : ''}
        ${task.dueTime ? `<div class="day-task-time"><i class="material-icons">schedule</i> ${task.dueTime}</div>` : ''}
        <div class="task-checkbox">
          <input type="checkbox" id="day-task-${task.id}" ${task.completed ? 'checked' : ''}>
          <label for="day-task-${task.id}"></label>
        </div>
      </div>
    `;
  }

  renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    if (this.categories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="material-icons">category</i>
          <h3>No categories yet</h3>
          <p>Create your first category to organize your tasks</p>
          <button class="btn btn-primary" onclick="app.openCategoryModal()">
            <i class="material-icons">add</i>
            <span>Add Category</span>
          </button>
        </div>
      `;
      return;
    }

    this.categories.forEach(category => {
      const categoryCard = this.createCategoryCard(category);
      container.appendChild(categoryCard);
    });
  }

  createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.dataset.categoryId = category.id;

    // Count tasks in this category
    const taskCount = this.tasks.filter(t => t.category === category.id).length;

    card.innerHTML = `
      <div class="category-header">
        <div class="category-color" style="background-color: ${category.color}"></div>
        <h3 class="category-name">${category.name}</h3>
        <div class="category-actions">
          <button class="task-action-btn" onclick="app.editCategory('${category.id}')">
            <i class="material-icons">edit</i>
          </button>
          <button class="task-action-btn" onclick="app.deleteCategory('${category.id}')">
            <i class="material-icons">delete</i>
          </button>
        </div>
      </div>
      <div class="category-stats">
        <span class="category-task-count">${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
      </div>
    `;

    return card;
  }

  openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');

    // Reset form
    form.reset();

    if (categoryId) {
      // Edit mode
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-color').value = category.color;

        document.querySelector('#category-modal .modal-title').textContent = 'Edit Category';
      }
    } else {
      // Add mode
      document.getElementById('category-id').value = '';
      document.querySelector('#category-modal .modal-title').textContent = 'Add New Category';
    }

    this.openModal('category-modal');
  }

  saveCategory() {
    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value.trim();
    const color = document.getElementById('category-color').value;

    if (!name) {
      this.showToast('Please enter a category name');
      return;
    }

    if (categoryId) {
      // Update existing category
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        category.name = name;
        category.color = color;
      }
      this.showToast('Category updated successfully');
    } else {
      // Add new category
      const newCategory = {
        id: this.generateId(),
        name,
        color
      };

      this.categories.push(newCategory);
      this.showToast('Category added successfully');
    }

    this.saveCategories();
    this.renderCategories();
    this.closeModal('category-modal');

    // Update category options in task form
    const categorySelect = document.getElementById('task-category');
    if (categorySelect) {
      categorySelect.innerHTML = '';
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  }

  editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  deleteCategory(categoryId) {
    // Check if category is in use
    const tasksInCategory = this.tasks.filter(t => t.category === categoryId);

    if (tasksInCategory.length > 0) {
      if (!confirm(`This category is used by ${tasksInCategory.length} task(s). Are you sure you want to delete it? Tasks will be uncategorized.`)) {
        return;
      }

      // Update tasks to remove category
      this.tasks.forEach(task => {
        if (task.category === categoryId) {
          task.category = null;
        }
      });

      this.saveTasks();
    } else {
      if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }

    this.categories = this.categories.filter(c => c.id !== categoryId);
    this.saveCategories();
    this.renderCategories();
    this.showToast('Category deleted successfully');
  }

  renderSettings() {
    // Set notification settings
    document.getElementById('enable-notifications').checked = this.notifications.enabled;
    document.getElementById('notification-sound').checked = this.notifications.sound;

    // Set backup settings
    document.getElementById('auto-backup').checked = this.backupSettings.auto;
    document.getElementById('backup-frequency').value = this.backupSettings.frequency;

    // Update last backup date
    this.updateBackupInfo();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icon
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  setLanguage(lang) {
    this.currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', lang);

    // Update language toggle
    document.getElementById('lang-text').textContent = lang === 'en' ? '🇺🇸' : '🇸🇦';

    // Update translations
    this.updateTranslations();
  }

  updateTranslations() {
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);

      if (translation) {
        // Handle different element types
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
  }

  getTranslation(key) {
    // Import translations
    const translations = {
      en: {
        // App
        'app.title': 'Task Manager',

        // Navigation
        'nav.tasks': 'Tasks',
        'nav.calendar': 'Calendar',
        'nav.categories': 'Categories',
        'nav.settings': 'Settings',

        // User
        'user.greeting': 'Welcome',

        // Tasks
        'tasks.title': 'My Tasks',
        'tasks.add': 'Add Task',
        'tasks.search': 'Search tasks...',
        'tasks.empty.title': 'No tasks yet',
        'tasks.empty.description': 'Create your first task to get started',

        // Categories
        'categories.title': 'Categories',
        'categories.add': 'Add Category',
        'category.work': 'Work',
        'category.personal': 'Personal',
        'category.urgent': 'Urgent',

        // Calendar
        'calendar.title': 'Calendar',

        // Settings
        'settings.title': 'Settings',
        'settings.notifications': 'Notifications',
        'settings.enableNotifications': 'Enable Notifications',
        'settings.notificationSound': 'Notification Sound',
        'settings.backup': 'Backup Settings',
        'settings.autoBackup': 'Automatic Backup',
        'settings.backupFrequency': 'Backup Frequency',

        // Filter
        'filter.allCategories': 'All Categories',
        'filter.allStatus': 'All Status',

        // Status
        'status.pending': 'Pending',
        'status.completed': 'Completed',

        // Progress
        'progress.completed': 'Completed',

        // Backup
        'backup.manual': 'Backup Now',
        'backup.last': 'Last backup:',
        'backup.restore': 'Restore Backup',
        'backup.success': 'Backup completed successfully',
        'backup.restore.success': 'Data restored successfully',
        'backup.restore.error': 'Error restoring backup',

        // Frequency
        'frequency.daily': 'Daily',
        'frequency.weekly': 'Weekly',
        'frequency.monthly': 'Monthly',

        // Modals
        'modal.close': 'Close',
        'modal.cancel': 'Cancel',
        'modal.save': 'Save',

        // Toast
        'toast.taskAdded': 'Task added successfully',
        'toast.taskUpdated': 'Task updated successfully',
        'toast.taskDeleted': 'Task deleted successfully',
        'toast.categoryAdded': 'Category added successfully',
        'toast.categoryUpdated': 'Category updated successfully',
        'toast.categoryDeleted': 'Category deleted successfully',

        // Form
        'form.title': 'Title',
        'form.description': 'Description',
        'form.category': 'Category',
        'form.dueDate': 'Due Date',
        'form.dueTime': 'Due Time',
        'form.notifications': 'Enable Notifications',
        'form.name': 'Name',
        'form.color': 'Color',
        'form.required': 'This field is required',
      },
      ar: {
        // App
        'app.title': 'مدير المهام',

        // Navigation
        'nav.tasks': 'المهام',
        'nav.calendar': 'التقويم',
        'nav.categories': 'الفئات',
        'nav.settings': 'الإعدادات',

        // User
        'user.greeting': 'مرحباً',

        // Tasks
        'tasks.title': 'مهامي',
        'tasks.add': 'إضافة مهمة',
        'tasks.search': 'البحث في المهام...',
        'tasks.empty.title': 'لا توجد مهام بعد',
        'tasks.empty.description': 'أنشئ أول مهمة للبدء',

        // Categories
        'categories.title': 'الفئات',
        'categories.add': 'إضافة فئة',
        'category.work': 'العمل',
        'category.personal': 'شخصي',
        'category.urgent': 'عاجل',

        // Calendar
        'calendar.title': 'التقويم',

        // Settings
        'settings.title': 'الإعدادات',
        'settings.notifications': 'الإشعارات',
        'settings.enableNotifications': 'تمكين الإشعارات',
        'settings.notificationSound': 'صوت الإشعار',
        'settings.backup': 'إعدادات النسخ الاحتياطي',
        'settings.autoBackup': 'نسخ احتياطي تلقائي',
        'settings.backupFrequency': 'تكرار النسخ الاحتياطي',

        // Filter
        'filter.allCategories': 'جميع الفئات',
        'filter.allStatus': 'جميع الحالات',

        // Status
        'status.pending': 'معلق',
        'status.completed': 'مكتمل',

        // Progress
        'progress.completed': 'مكتمل',

        // Backup
        'backup.manual': 'نسخ احتياطي الآن',
        'backup.last': 'آخر نسخة احتياطية:',
        'backup.restore': 'استعادة نسخة احتياطية',
        'backup.success': 'تم النسخ الاحتياطي بنجاح',
        'backup.restore.success': 'تم استعادة البيانات بنجاح',
        'backup.restore.error': 'خطأ في استعادة النسخة الاحتياطية',

        // Frequency
        'frequency.daily': 'يومي',
        'frequency.weekly': 'أسبوعي',
        'frequency.monthly': 'شهري',

        // Modals
        'modal.close': 'إغلاق',
        'modal.cancel': 'إلغاء',
        'modal.save': 'حفظ',

        // Toast
        'toast.taskAdded': 'تمت إضافة المهمة بنجاح',
        'toast.taskUpdated': 'تم تحديث المهمة بنجاح',
        'toast.taskDeleted': 'تم حذف المهمة بنجاح',
        'toast.categoryAdded': 'تمت إضافة الفئة بنجاح',
        'toast.categoryUpdated': 'تم تحديث الفئة بنجاح',
        'toast.categoryDeleted': 'تم حذف الفئة بنجاح',

        // Form
        'form.title': 'العنوان',
        'form.description': 'الوصف',
        'form.category': 'الفئة',
        'form.dueDate': 'تاريخ الاستحقاق',
        'form.dueTime': 'وقت الاستحقاق',
        'form.notifications': 'تمكين الإشعارات',
        'form.name': 'الاسم',
        'form.color': 'اللون',
        'form.required': 'هذا الحقل مطلوب',
      }
    };

    return translations[this.currentLang][key] || key;
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const today = new Date();
      dateElement.textContent = today.toLocaleDateString(this.currentLang, options);
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(this.currentLang, options);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Data persistence
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    }
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  saveBackupSettings() {
    localStorage.setItem('backupSettings', JSON.stringify(this.backupSettings));
  }

  updateBackupInfo() {
    const backupInfo = document.getElementById('backup-info');
    if (backupInfo) {
      const lastBackupDate = document.getElementById('last-backup-date');
      if (this.lastBackupDate) {
        lastBackupDate.textContent = this.formatDate(this.lastBackupDate);
      } else {
        lastBackupDate.textContent = 'Never';
      }
    }
  }

  // Backup functionality
  backupData() {
    const data = {
      tasks: this.tasks,
      categories: this.categories,
      notifications: this.notifications,
      backupSettings: this.backupSettings,
      theme: this.currentTheme,
      language: this.currentLang,
      backupDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `task-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update last backup date
    this.lastBackupDate = new Date().toISOString();
    this.backupSettings.lastBackup = this.lastBackupDate;
    this.saveBackupSettings();
    this.updateBackupInfo();

    this.showToast(this.getTranslation('backup.success'));
  }

  restoreBackup(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Restore data
        if (data.tasks) this.tasks = data.tasks;
        if (data.categories) this.categories = data.categories;
        if (data.notifications) this.notifications = data.notifications;
        if (data.backupSettings) this.backupSettings = data.backupSettings;
        if (data.theme) this.setTheme(data.theme);
        if (data.language) this.setLanguage(data.language);

        // Save data
        this.saveTasks();
        this.saveCategories();
        this.saveNotifications();
        this.saveBackupSettings();

        // Update UI
        this.renderView(this.currentView);
        this.updateBackupInfo();

        this.showToast(this.getTranslation('backup.restore.success'));
      } catch (error) {
        console.error('Error restoring backup:', error);
        this.showToast(this.getTranslation('backup.restore.error'));
      }
    };

    reader.readAsText(file);
  }

  checkAutoBackup() {
    if (!this.backupSettings.auto) return;

    const now = new Date();
    const lastBackup = this.lastBackupDate ? new Date(this.lastBackupDate) : null;

    if (!lastBackup) {
      // No backup yet, create one
      this.backupData();
      return;
    }

    // Check if it's time for a new backup
    let shouldBackup = false;

    switch (this.backupSettings.frequency) {
      case 'daily':
        shouldBackup = now.getDate() !== lastBackup.getDate() || 
                      now.getMonth() !== lastBackup.getMonth() || 
                      now.getFullYear() !== lastBackup.getFullYear();
        break;
      case 'weekly':
        const daysDiff = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
        shouldBackup = daysDiff >= 7;
        break;
      case 'monthly':
        shouldBackup = now.getMonth() !== lastBackup.getMonth() || 
                      now.getFullYear() !== lastBackup.getFullYear();
        break;
    }

    if (shouldBackup) {
      this.backupData();
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskManager();
  app.init();

  // Make app globally accessible
  window.app = app;
});
