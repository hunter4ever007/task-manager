
// Main application module
class TaskManager {
  constructor() {
    this.currentView = 'tasks';
    this.calendar = null;
    this.editingTaskId = null;
    this.editingCategoryId = null;
  }

  init() {
    // Load data
    this.tasks = storage.getTasks();
    this.categories = storage.getCategories();
    this.settings = storage.getSettings();

    // Initialize modules
    i18n.setLanguage(this.settings.language);
    this.setTheme(this.settings.theme);
    notifications.init();
    backup.updateBackupInfo();

    // Setup UI
    this.setupEventListeners();
    this.updateCurrentDate();
    this.renderView(this.currentView);

    // Make app globally accessible
    window.app = this;
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(item.dataset.view);
      });
    });

    // Mobile menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Language toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', () => {
      this.openTaskModal();
    });

    // Add category button
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.openCategoryModal();
    });

    // Task search
    document.getElementById('task-search').addEventListener('input', (e) => {
      this.filterTasks(e.target.value);
    });

    // Filter category
    document.getElementById('filter-category').addEventListener('change', (e) => {
      this.filterTasksByCategory(e.target.value);
    });

    // Filter status
    document.getElementById('filter-status').addEventListener('change', (e) => {
      this.filterTasksByStatus(e.target.value);
    });

    // Backup button
    document.getElementById('backup-btn').addEventListener('click', () => {
      const success = backup.createBackup();
      this.showToast(success ? 'Backup completed successfully' : 'Failed to create backup');
    });

    // Restore backup button
    document.getElementById('restore-backup-btn').addEventListener('click', () => {
      document.getElementById('restore-backup-file').click();
    });

    // Restore backup file input
    document.getElementById('restore-backup-file').addEventListener('change', (e) => {
      this.restoreBackup(e.target.files[0]);
    });

    // Export data button
    document.getElementById('export-data-btn').addEventListener('click', () => {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);

      this.showToast('Data exported successfully');
    });

    // Clear data button
    document.getElementById('clear-data-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        storage.clearAll();
        location.reload();
      }
    });

    // Settings
    document.getElementById('enable-notifications').addEventListener('change', (e) => {
      const soundEnabled = document.getElementById('notification-sound').checked;
      notifications.updateSettings(e.target.checked, soundEnabled);
    });

    document.getElementById('notification-sound').addEventListener('change', (e) => {
      const notificationsEnabled = document.getElementById('enable-notifications').checked;
      notifications.updateSettings(notificationsEnabled, e.target.checked);
    });

    document.getElementById('auto-backup').addEventListener('change', (e) => {
      const frequency = document.getElementById('backup-frequency').value;
      backup.updateSettings(e.target.checked, frequency);
    });

    document.getElementById('backup-frequency').addEventListener('change', (e) => {
      const autoBackup = document.getElementById('auto-backup').checked;
      backup.updateSettings(autoBackup, e.target.value);
    });

    // Modal close buttons
    document.getElementById('close-task-modal').addEventListener('click', () => {
      this.closeTaskModal();
    });

    document.getElementById('close-category-modal').addEventListener('click', () => {
      this.closeCategoryModal();
    });

    // Modal background click to close
    document.getElementById('task-modal').addEventListener('click', (e) => {
      if (e.target.id === 'task-modal') {
        this.closeTaskModal();
      }
    });

    document.getElementById('category-modal').addEventListener('click', (e) => {
      if (e.target.id === 'category-modal') {
        this.closeCategoryModal();
      }
    });

    // Cancel buttons
    document.getElementById('cancel-task-btn').addEventListener('click', () => {
      this.closeTaskModal();
    });

    document.getElementById('cancel-category-btn').addEventListener('click', () => {
      this.closeCategoryModal();
    });

    // Form submissions
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });

    document.getElementById('category-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCategory();
    });
  }

  switchView(view) {
    this.currentView = view;

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === view) {
        item.classList.add('active');
      }
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');

    // Render the view
    this.renderView(view);

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
  }

  renderView(view) {
    switch (view) {
      case 'tasks':
        this.renderTasks();
        this.updateProgress();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'categories':
        this.renderCategories();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }

  renderTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="material-icons">assignment</i>
          <h3 data-i18n="tasks.empty.title">No tasks yet</h3>
          <p data-i18n="tasks.empty.description">Create your first task to get started</p>
          <button class="btn btn-primary" onclick="app.openTaskModal()">
            <i class="material-icons">add</i>
            <span data-i18n="tasks.add">Add Task</span>
          </button>
        </div>
      `;
      return;
    }

    this.tasks.forEach(task => {
      const taskCard = this.createTaskCard(task);
      container.appendChild(taskCard);
    });
  }

  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.taskId = task.id;

    const category = this.categories.find(c => c.id === task.category);
    const categoryClass = category ? `category-${category.id}` : '';

    card.innerHTML = `
      <div class="task-header">
        <span class="task-category ${categoryClass}">${category ? category.name : 'Uncategorized'}</span>
        <div class="task-actions">
          <button class="task-action-btn" onclick="app.editTask('${task.id}')">
            <i class="material-icons">edit</i>
          </button>
          <button class="task-action-btn" onclick="app.deleteTask('${task.id}')">
            <i class="material-icons">delete</i>
          </button>
        </div>
      </div>
      <h3 class="task-title">${task.title}</h3>
      ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
      ${task.dueDate ? `
        <div class="task-due-date">
          <i class="material-icons">schedule</i>
          ${this.formatDate(task.dueDate)}
        </div>
      ` : ''}
      <div class="task-checkbox">
        <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} 
               onchange="app.toggleTaskComplete('${task.id}')">
        <label for="task-${task.id}"></label>
      </div>
    `;

    return card;
  }

  toggleTaskComplete(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      storage.saveTasks(this.tasks);
      this.renderTasks();
      this.updateProgress();
      this.showToast(task.completed ? 'Task marked as completed' : 'Task marked as pending');
    }
  }

  updateProgress() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
  }

  openTaskModal(taskId = null) {
    const form = document.getElementById('task-form');

    // Reset form
    form.reset();

    // Set categories
    const categorySelect = document.getElementById('task-category');
    categorySelect.innerHTML = '';
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    if (taskId) {
      // Edit mode
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        this.editingTaskId = taskId;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-category').value = task.category || '';
        document.getElementById('task-date').value = task.dueDate || '';
        document.getElementById('task-time').value = task.dueTime || '';
        document.getElementById('task-reminder').value = task.reminder || 'none';

        document.querySelector('#task-modal-title').textContent = 'Edit Task';
      }
    } else {
      // Add mode
      this.editingTaskId = null;
      document.querySelector('#task-modal-title').textContent = 'Add New Task';
    }

    document.getElementById('task-modal').classList.add('active');
  }

  closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    this.editingTaskId = null;
  }

  saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const category = document.getElementById('task-category').value;
    const dueDate = document.getElementById('task-date').value;
    const dueTime = document.getElementById('task-time').value;
    const reminder = document.getElementById('task-reminder').value;

    if (!title) {
      this.showToast('Please enter a task title');
      return;
    }

    if (this.editingTaskId) {
      // Update existing task
      const task = this.tasks.find(t => t.id === this.editingTaskId);
      if (task) {
        task.title = title;
        task.description = description;
        task.category = category;
        task.dueDate = dueDate;
        task.dueTime = dueTime;
        task.reminder = reminder;
        task.updatedAt = new Date().toISOString();
      }
      this.showToast('Task updated successfully');
    } else {
      // Add new task
      const newTask = {
        id: this.generateId(),
        title,
        description,
        category,
        dueDate,
        dueTime,
        reminder,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.tasks.push(newTask);
      this.showToast('Task added successfully');
    }

    storage.saveTasks(this.tasks);
    this.renderTasks();
    this.updateProgress();
    this.closeTaskModal();
  }

  editTask(taskId) {
    this.openTaskModal(taskId);
  }

  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      storage.saveTasks(this.tasks);
      this.renderTasks();
      this.updateProgress();
      this.showToast('Task deleted successfully');
    }
  }

  filterTasks(searchTerm) {
    const filteredTasks = searchTerm 
      ? this.tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : this.tasks;

    this.renderFilteredTasks(filteredTasks);
  }

  filterTasksByCategory(categoryId) {
    const filteredTasks = categoryId === 'all' 
      ? this.tasks 
      : this.tasks.filter(task => task.category === categoryId);

    this.renderFilteredTasks(filteredTasks);
  }

  filterTasksByStatus(status) {
    const filteredTasks = status === 'all' 
      ? this.tasks 
      : status === 'completed' 
        ? this.tasks.filter(task => task.completed)
        : this.tasks.filter(task => !task.completed);

    this.renderFilteredTasks(filteredTasks);
  }

  renderFilteredTasks(tasks) {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="material-icons">search_off</i>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      `;
      return;
    }

    tasks.forEach(task => {
      const taskCard = this.createTaskCard(task);
      container.appendChild(taskCard);
    });
  }

  renderCalendar() {
    const container = document.getElementById('calendar-container');
    this.calendar = new Calendar(this.tasks, container);
    this.calendar.render();
  }

  showDayTasks(dateStr) {
    const dayTasks = this.tasks.filter(task => task.dueDate === dateStr);
    const date = new Date(dateStr);
    const formattedDate = this.formatDate(dateStr);

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'day-tasks-modal';

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Tasks for ${formattedDate}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${dayTasks.length === 0 
          ? '<p>No tasks for this day</p>' 
          : dayTasks.map(task => this.createDayTaskHTML(task)).join('')
        }
      </div>
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'day-tasks-modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add close event listener
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
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
    const form = document.getElementById('category-form');

    // Reset form
    form.reset();

    if (categoryId) {
      // Edit mode
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        this.editingCategoryId = categoryId;
        document.getElementById('category-name').value = category.name;

        // Set color radio button
        const colorRadio = document.querySelector(`input[name="category-color"][value="${category.color}"]`);
        if (colorRadio) {
          colorRadio.checked = true;
        }

        document.querySelector('#category-modal-title').textContent = 'Edit Category';
      }
    } else {
      // Add mode
      this.editingCategoryId = null;
      document.querySelector('#category-modal-title').textContent = 'Add New Category';
    }

    document.getElementById('category-modal').classList.add('active');
  }

  closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
    this.editingCategoryId = null;
  }

  saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const colorInput = document.querySelector('input[name="category-color"]:checked');
    const color = colorInput ? colorInput.value : '#2196F3';

    if (!name) {
      this.showToast('Please enter a category name');
      return;
    }

    if (this.editingCategoryId) {
      // Update existing category
      const category = this.categories.find(c => c.id === this.editingCategoryId);
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

    storage.saveCategories(this.categories);
    this.renderCategories();
    this.closeCategoryModal();
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

      storage.saveTasks(this.tasks);
    } else {
      if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }

    this.categories = this.categories.filter(c => c.id !== categoryId);
    storage.saveCategories(this.categories);
    this.renderCategories();
    this.showToast('Category deleted successfully');
  }

  renderSettings() {
    // Set notification settings
    document.getElementById('enable-notifications').checked = this.settings.notifications.enabled;
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
