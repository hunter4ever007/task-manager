
    else {
      // Add mode
      document.getElementById('task-id').value = '';
      document.querySelector('#task-modal .modal-title').textContent = 'Add New Task';
    }

    this.openModal('task-modal');
  }

  saveTask() {
    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const category = document.getElementById('task-category').value;
    const dueDate = document.getElementById('task-due-date').value;
    const dueTime = document.getElementById('task-due-time').value;
    const notifications = document.getElementById('task-notifications').checked;

    if (!title) {
      this.showToast('Please enter a task title');
      return;
    }

    if (taskId) {
      // Update existing task
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.title = title;
        task.description = description;
        task.category = category;
        task.dueDate = dueDate;
        task.dueTime = dueTime;
        task.notifications = notifications;
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
        notifications,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.tasks.push(newTask);
      this.showToast('Task added successfully');
    }

    this.saveTasks();
    this.renderTasks();
    this.updateProgress();
    this.closeModal('task-modal');
  }

  editTask(taskId) {
    this.openTaskModal(taskId);
  }

  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Create calendar header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const header = document.createElement('div');
    header.className = 'calendar-header';

    header.innerHTML = `
      <div class="calendar-nav">
        <button id="prev-month"><i class="material-icons">chevron_left</i></button>
      </div>
      <h2 class="calendar-title">${monthNames[currentMonth]} ${currentYear}</h2>
      <div class="calendar-nav">
        <button id="next-month"><i class="material-icons">chevron_right</i></button>
      </div>
    `;

    container.innerHTML = '';
    container.appendChild(header);

    // Create calendar grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });

    // Calculate first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day other-month';
      const prevMonth = new Date(currentYear, currentMonth, 0).getDate();
      emptyDay.innerHTML = `<div class="calendar-day-number">${prevMonth - firstDay + i + 1}</div>`;
      grid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';

      // Check if it's today
      const today = new Date();
      if (currentYear === today.getFullYear() && 
          currentMonth === today.getMonth() && 
          day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Format date for comparison
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find tasks for this day
      const dayTasks = this.tasks.filter(task => task.dueDate === dateStr);

      // Create task dots
      let taskDots = '';
      if (dayTasks.length > 0) {
        taskDots = '<div class="calendar-day-tasks">';
        dayTasks.forEach(task => {
          if (task.category) {
            taskDots += `<span class="calendar-task-dot ${task.category}"></span>`;
          }
        });
        taskDots += '</div>';
      }

      dayElement.innerHTML = `
        <div class="calendar-day-number">${day}</div>
        ${taskDots}
      `;

      // Add click event to show tasks for this day
      dayElement.addEventListener('click', () => {
        this.showDayTasks(dateStr);
      });

      grid.appendChild(dayElement);
    }

    container.appendChild(grid);

    // Add navigation event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
      this.renderCalendarMonth(currentYear, currentMonth - 1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
      this.renderCalendarMonth(currentYear, currentMonth + 1);
    });
  }

  renderCalendarMonth(year, month) {
    // Adjust year if month is out of range
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }

    const container = document.getElementById('calendar-container');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Update calendar header
    document.querySelector('.calendar-title').textContent = `${monthNames[month]} ${year}`;

    // Clear and rebuild calendar grid
    const grid = document.querySelector('.calendar-grid');
    grid.innerHTML = '';

    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });

    // Calculate first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day other-month';
      const prevMonth = new Date(year, month, 0).getDate();
      emptyDay.innerHTML = `<div class="calendar-day-number">${prevMonth - firstDay + i + 1}</div>`;
      grid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';

      // Check if it's today
      const today = new Date();
      if (year === today.getFullYear() && 
          month === today.getMonth() && 
          day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Format date for comparison
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find tasks for this day
      const dayTasks = this.tasks.filter(task => task.dueDate === dateStr);

      // Create task dots
      let taskDots = '';
      if (dayTasks.length > 0) {
        taskDots = '<div class="calendar-day-tasks">';
        dayTasks.forEach(task => {
          if (task.category) {
            taskDots += `<span class="calendar-task-dot ${task.category}"></span>`;
          }
        });
        taskDots += '</div>';
      }

      dayElement.innerHTML = `
        <div class="calendar-day-number">${day}</div>
        ${taskDots}
      `;

      // Add click event to show tasks for this day
      dayElement.addEventListener('click', () => {
        this.showDayTasks(dateStr);
      });

      grid.appendChild(dayElement);
    }

    // Update navigation event listeners
    document.getElementById('prev-month').onclick = () => {
      this.renderCalendarMonth(year, month - 1);
    };

    document.getElementById('next-month').onclick = () => {
      this.renderCalendarMonth(year, month + 1);
    };
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
  }

  createDayTaskHTML(task) {
    const category = this.categories.find(c => c.id === task.category);
    const categoryClass = category ? `category-${category.id}` : '';

    return `
      <div class="day-task ${task.completed ? 'completed' : ''}">
        <div class="day-task-header">
          <span class="task-category ${categoryClass}">${category ? category.name : 'Uncategorized'}</span>
          <div class="task-checkbox">
            <input type="checkbox" id="day-task-${task.id}" ${task.completed ? 'checked' : ''} 
                   onchange="app.toggleTaskComplete('${task.id}')">
            <label for="day-task-${task.id}"></label>
          </div>
        </div>
        <h4 class="day-task-title">${task.title}</h4>
        ${task.description ? `<p class="day-task-description">${task.description}</p>` : ''}
        ${task.dueTime ? `<div class="day-task-time"><i class="material-icons">schedule</i> ${task.dueTime}</div>` : ''}
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
          <p>Create your first category to organize tasks</p>
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
      <div class="category-header" style="background-color: ${category.color};">
        <h3>${category.name}</h3>
        <div class="category-actions">
          <button class="category-action-btn" onclick="app.editCategory('${category.id}')">
            <i class="material-icons">edit</i>
          </button>
          <button class="category-action-btn" onclick="app.deleteCategory('${category.id}')">
            <i class="material-icons">delete</i>
          </button>
        </div>
      </div>
      <div class="category-body">
        <p class="category-task-count">${taskCount} task${taskCount !== 1 ? 's' : ''}</p>
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
  }

  editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  deleteCategory(categoryId) {
    // Check if category is in use
    const tasksInCategory = this.tasks.filter(t => t.category === categoryId);

    if (tasksInCategory.length > 0) {
      if (!confirm(`This category has ${tasksInCategory.length} task(s). These tasks will become uncategorized. Are you sure?`)) {
        return;
      }

      // Update tasks to remove category
      this.tasks.forEach(task => {
        if (task.category === categoryId) {
          task.category = '';
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
    // Update notification settings
    document.getElementById('enable-notifications').checked = this.notifications.enabled;
    document.getElementById('notification-sound').checked = this.notifications.sound;

    // Update backup settings
    document.getElementById('auto-backup').checked = this.backupSettings.auto;
    document.getElementById('backup-frequency').value = this.backupSettings.frequency;

    // Update last backup date
    const lastBackupElement = document.getElementById('last-backup');
    if (this.lastBackupDate) {
      lastBackupElement.textContent = this.formatDate(this.lastBackupDate);
    } else {
      lastBackupElement.textContent = 'Never';
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').innerHTML = 
      theme === 'light' 
        ? '<i class="material-icons">dark_mode</i>' 
        : '<i class="material-icons">light_mode</i>';

    localStorage.setItem('theme', theme);
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(this.currentLang);
  }

  setLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.getElementById('lang-text').textContent = lang === 'en' ? '🇺🇸' : '🇸🇦';

    // Update all elements with i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = translations[lang][key] || key;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = translations[lang][key] || key;
    });

    localStorage.setItem('language', lang);
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

    // Trigger reflow
    toast.offsetHeight;

    // Show toast
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);

    document.getElementById('current-date').textContent = formattedDate;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Data persistence
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
      this.tasks = JSON.parse(tasksData);
    }
  }

  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  loadCategories() {
    const categoriesData = localStorage.getItem('categories');
    if (categoriesData) {
      this.categories = JSON.parse(categoriesData);
    }
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.setupNotifications();
  }

  saveBackupSettings() {
    localStorage.setItem('backupSettings', JSON.stringify(this.backupSettings));
    this.checkAutoBackup();
  }

  // Backup functionality
  backupData() {
    const backupData = {
      tasks: this.tasks,
      categories: this.categories,
      settings: {
        language: this.currentLang,
        theme: this.currentTheme,
        notifications: this.notifications,
        backupSettings: this.backupSettings
      },
      backupDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    // Update last backup date
    this.lastBackupDate = new Date().toISOString();
    this.backupSettings.lastBackup = this.lastBackupDate;
    this.saveBackupSettings();
    this.updateBackupInfo();

    this.showToast('Backup created successfully');
  }

  restoreBackup(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);

        // Restore data
        if (backupData.tasks) {
          this.tasks = backupData.tasks;
          this.saveTasks();
        }

        if (backupData.categories) {
          this.categories = backupData.categories;
          this.saveCategories();
        }

        if (backupData.settings) {
          const settings = backupData.settings;

          if (settings.language) {
            this.currentLang = settings.language;
            this.setLanguage(this.currentLang);
          }

          if (settings.theme) {
            this.currentTheme = settings.theme;
            this.setTheme(this.currentTheme);
          }

          if (settings.notifications) {
            this.notifications = settings.notifications;
            this.saveNotifications();
          }

          if (settings.backupSettings) {
            this.backupSettings = settings.backupSettings;
            this.saveBackupSettings();
          }
        }

        // Update last backup date
        if (backupData.backupDate) {
          this.lastBackupDate = backupData.backupDate;
          this.updateBackupInfo();
        }

        // Refresh UI
        this.renderView(this.currentView);
        this.showToast('Backup restored successfully');
      } catch (error) {
        this.showToast('Error restoring backup: Invalid file format');
        console.error('Backup restore error:', error);
      }
    };

    reader.readAsText(file);
  }

  updateBackupInfo() {
    const lastBackupElement = document.getElementById('last-backup-date');
    if (this.lastBackupDate) {
      lastBackupElement.textContent = this.formatDate(this.lastBackupDate);
    } else {
      lastBackupElement.textContent = 'Never';
    }
  }

  checkAutoBackup() {
    if (!this.backupSettings.auto) return;

    const now = new Date();
    const lastBackup = this.lastBackupDate ? new Date(this.lastBackupDate) : null;

    if (!lastBackup) {
      // No previous backup, create one
      this.backupData();
      return;
    }

    const timeDiff = now - lastBackup;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    let shouldBackup = false;

    switch (this.backupSettings.frequency) {
      case 'daily':
        shouldBackup = daysDiff >= 1;
        break;
      case 'weekly':
        shouldBackup = daysDiff >= 7;
        break;
      case 'monthly':
        shouldBackup = daysDiff >= 30;
        break;
    }

    if (shouldBackup) {
      this.backupData();
    }
  }
}

// Translations
const translations = {
  en: {
    'app.title': 'Task Manager',
    'user.greeting': 'Welcome',
    'nav.tasks': 'Tasks',
    'nav.calendar': 'Calendar',
    'nav.categories': 'Categories',
    'nav.settings': 'Settings',
    'backup.manual': 'Backup Now',
    'backup.last': 'Last backup:',
    'tasks.title': 'My Tasks',
    'tasks.search': 'Search tasks...',
    'filter.allCategories': 'All Categories',
    'category.work': 'Work',
    'category.personal': 'Personal',
    'category.urgent': 'Urgent',
    'filter.allStatus': 'All Status',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'tasks.add': 'Add Task',
    'progress.completed': 'Completed',
    'calendar.title': 'Calendar',
    'categories.title': 'Categories',
    'categories.add': 'Add Category',
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.enableNotifications': 'Enable Notifications',
    'settings.notificationSound': 'Notification Sound',
    'settings.backup': 'Backup Settings',
    'settings.autoBackup': 'Automatic Backup',
    'settings.backupFrequency': 'Backup Frequency',
    'frequency.daily': 'Daily',
    'frequency.weekly': 'Weekly',
    'frequency.monthly': 'Monthly',
    'restore.backup': 'Restore Backup',
    'restore.description': 'Select a backup file to restore your data',
    'task.title': 'Title',
    'task.description': 'Description',
    'task.category': 'Category',
    'task.dueDate': 'Due Date',
    'task.dueTime': 'Due Time',
    'task.notifications': 'Enable Notifications',
    'category.name': 'Category Name',
    'category.color': 'Color',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'tasks.empty.title': 'No tasks yet',
    'tasks.empty.description': 'Create your first task to get started'
  },
  ar: {
    'app.title': 'مدير المهام',
    'user.greeting': 'مرحبا',
    'nav.tasks': 'المهام',
    'nav.calendar': 'التقويم',
    'nav.categories': 'الفئات',
    'nav.settings': 'الإعدادات',
    'backup.manual': 'نسخ احتياطي الآن',
    'backup.last': 'آخر نسخة احتياطية:',
    'tasks.title': 'مهامي',
    'tasks.search': 'البحث عن مهام...',
    'filter.allCategories': 'جميع الفئات',
    'category.work': 'العمل',
    'category.personal': 'شخصي',
    'category.urgent': 'عاجل',
    'filter.allStatus': 'جميع الحالات',
    'status.pending': 'معلق',
    'status.completed': 'مكتمل',
    'tasks.add': 'إضافة مهمة',
    'progress.completed': 'مكتمل',
    'calendar.title': 'التقويم',
    'categories.title': 'الفئات',
    'categories.add': 'إضافة فئة',
    'settings.title': 'الإعدادات',
    'settings.notifications': 'الإشعارات',
    'settings.enableNotifications': 'تفعيل الإشعارات',
    'settings.notificationSound': 'صوت الإشعار',
    'settings.backup': 'إعدادات النسخ الاحتياطي',
    'settings.autoBackup': 'نسخ احتياطي تلقائي',
    'settings.backupFrequency': 'تكرار النسخ الاحتياطي',
    'frequency.daily': 'يومي',
    'frequency.weekly': 'أسبوعي',
    'frequency.monthly': 'شهري',
    'restore.backup': 'استعادة النسخة الاحتياطية',
    'restore.description': 'حدد ملف نسخ احتياطي لاستعادة بياناتك',
    'task.title': 'العنوان',
    'task.description': 'الوصف',
    'task.category': 'الفئة',
    'task.dueDate': 'تاريخ الاستحقاق',
    'task.dueTime': 'وقت الاستحقاق',
    'task.notifications': 'تفعيل الإشعارات',
    'category.name': 'اسم الفئة',
    'category.color': 'اللون',
    'button.cancel': 'إلغاء',
    'button.save': 'حفظ',
    'tasks.empty.title': 'لا توجد مهام بعد',
    'tasks.empty.description': 'أنشئ أول مهمة للبدء'
  }
};
