
ption').value.trim();
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
