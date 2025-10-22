
// App main module
document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  const app = new TaskManager();
  app.init();
});

class TaskManager {
  constructor() {
    this.tasks = [];
    this.categories = [
      { id: 'work', name: 'Work', color: '#4285f4' },
      { id: 'personal', name: 'Personal', color: '#0f9d58' },
      { id: 'urgent', name: 'Urgent', color: '#db4437' }
    ];
    this.currentView = 'tasks';
    this.currentLang = localStorage.getItem('language') || 'en';
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.notifications = JSON.parse(localStorage.getItem('notifications')) || { enabled: false, sound: true };
    this.backupSettings = JSON.parse(localStorage.getItem('backupSettings')) || { 
      auto: false, 
      frequency: 'weekly', 
      lastBackup: null 
    };
    this.lastBackupDate = this.backupSettings.lastBackup;
  }

  init() {
    // Load data from localStorage
    this.loadTasks();
    this.loadCategories();

    // Set language and theme
    this.setLanguage(this.currentLang);
    this.setTheme(this.currentTheme);

    // Setup UI
    this.setupUI();
    this.setupEventListeners();
    this.setupNotifications();

    // Check for automatic backup
    this.checkAutoBackup();

    // Update current date
    this.updateCurrentDate();

    // Render the initial view
    this.renderView(this.currentView);
  }

  setupUI() {
    // Set initial view
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(`${this.currentView}-view`).classList.add('active');

    // Set active navigation item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === this.currentView) {
        item.classList.add('active');
      }
    });

    // Update backup info
    this.updateBackupInfo();
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
      this.backupData();
    });

    // Settings
    document.getElementById('enable-notifications').addEventListener('change', (e) => {
      this.notifications.enabled = e.target.checked;
      this.saveNotifications();
    });

    document.getElementById('notification-sound').addEventListener('change', (e) => {
      this.notifications.sound = e.target.checked;
      this.saveNotifications();
    });

    document.getElementById('auto-backup').addEventListener('change', (e) => {
      this.backupSettings.auto = e.target.checked;
      this.saveBackupSettings();
    });

    document.getElementById('backup-frequency').addEventListener('change', (e) => {
      this.backupSettings.frequency = e.target.value;
      this.saveBackupSettings();
    });

    // Add category button
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.openCategoryModal();
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        this.closeModal(modal.id);
      });
    });

    // Modal background click to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Task form submit
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });

    // Category form submit
    document.getElementById('category-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    // Restore backup input
    document.getElementById('restore-backup').addEventListener('change', (e) => {
      this.restoreBackup(e.target.files[0]);
    });
  }

  setupNotifications() {
    // Request notification permission
    if ('Notification' in window && this.notifications.enabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for due tasks every minute
    setInterval(() => {
      this.checkDueTasks();
    }, 60000);
  }

  checkDueTasks() {
    if (!this.notifications.enabled) return;

    const now = new Date();
    this.tasks.forEach(task => {
      if (task.completed || !task.dueDate || !task.notifications) return;

      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate - now;

      // Notify if task is due in the next 5 minutes
      if (timeDiff > 0 && timeDiff < 300000) {
        this.sendNotification(task);
      }
    });
  }

  sendNotification(task) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Task Due Soon', {
        body: `Your task "${task.title}" is due soon!`,
        icon: 'icons/icon-96x96.png'
      });

      if (this.notifications.sound) {
        // Play notification sound
        const audio = new Audio('sounds/notification.mp3');
        audio.play();
      }
    }
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
      this.saveTasks();
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
    const modal = document.getElementById('task-modal');
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
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-category').value = task.category || '';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-due-time').value = task.dueTime || '';
        document.getElementById('task-notifications').checked = task.notifications || false;

        document.querySelector('#task-modal .modal-title').textContent = 'Edit Task';
      }
    } else {
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
      this.showToast('Please enter a task title', 'error');
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
    }

    this.saveTasks();
    this.renderTasks();
    this.updateProgress();
    this.closeModal('task-modal');
    this.showToast(taskId ? 'Task updated successfully' : 'Task added successfully');
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
    const cards = document.querySelectorAll('.task-card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
      const title = card.querySelector('.task-title').textContent.toLowerCase();
      const description = card.querySelector('.task-description');
      const descText = description ? description.textContent.toLowerCase() : '';

      if (title.includes(term) || descText.includes(term)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterTasksByCategory(categoryId) {
    const cards = document.querySelectorAll('.task-card');

    cards.forEach(card => {
      if (categoryId === 'all') {
        card.style.display = '';
      } else {
        const task = this.tasks.find(t => t.id === card.dataset.taskId);
        if (task && task.category === categoryId) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      }
    });
  }

  filterTasksByStatus(status) {
    const cards = document.querySelectorAll('.task-card');

    cards.forEach(card => {
      if (status === 'all') {
        card.style.display = '';
      } else {
        const task = this.tasks.find(t => t.id === card.dataset.taskId);
        if (task) {
          if ((status === 'completed' && task.completed) || 
              (status === 'pending' && !task.completed)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        }
      }
    });
  }

  renderCalendar() {
    const container = document.getElementById('calendar-container');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

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

    // Get first day of month and number of days
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

      // Check if today
      const today = new Date();
      if (currentYear === today.getFullYear() && 
          currentMonth === today.getMonth() && 
          day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Get tasks for this day
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = this.tasks.filter(t => t.dueDate === dateStr);

      // Create day content
      let dayContent = `<div class="calendar-day-number">${day}</div>`;

      if (dayTasks.length > 0) {
        dayContent += '<div class="calendar-day-tasks">';
        dayTasks.forEach(task => {
          const category = this.categories.find(c => c.id === task.category);
          const categoryClass = category ? category.id : 'default';
          dayContent += `<span class="calendar-task-dot ${categoryClass}"></span>`;
        });
        dayContent += '</div>';
      }

      dayElement.innerHTML = dayContent;

      // Add click event to show tasks for this day
      dayElement.addEventListener('click', () => {
        this.showDayTasks(dateStr);
      });

      grid.appendChild(dayElement);
    }

    // Add empty cells for days after month ends
    const totalCells = grid.children.length - 7; // Subtract header row
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        emptyDay.innerHTML = `<div class="calendar-day-number">${i}</div>`;
        grid.appendChild(emptyDay);
      }
    }

    container.appendChild(grid);

    // Add navigation event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
      this.renderCalendarMonth(currentMonth - 1, currentYear);
    });

    document.getElementById('next-month').addEventListener('click', () => {
      this.renderCalendarMonth(currentMonth + 1, currentYear);
    });
  }

  renderCalendarMonth(month, year) {
    // Adjust year if month is out of range
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }

    const container = document.getElementById('calendar-container');
    const header = container.querySelector('.calendar-header');
    const grid = container.querySelector('.calendar-grid');

    // Update header
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    header.querySelector('.calendar-title').textContent = `${monthNames[month]} ${year}`;

    // Clear grid except headers
    while (grid.children.length > 7) {
      grid.removeChild(grid.lastChild);
    }

    // Get first day of month and number of days
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

      // Check if today
      const today = new Date();
      if (year === today.getFullYear() && 
          month === today.getMonth() && 
          day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Get tasks for this day
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = this.tasks.filter(t => t.dueDate === dateStr);

      // Create day content
      let dayContent = `<div class="calendar-day-number">${day}</div>`;

      if (dayTasks.length > 0) {
        dayContent += '<div class="calendar-day-tasks">';
        dayTasks.forEach(task => {
          const category = this.categories.find(c => c.id === task.category);
          const categoryClass = category ? category.id : 'default';
          dayContent += `<span class="calendar-task-dot ${categoryClass}"></span>`;
        });
        dayContent += '</div>';
      }

      dayElement.innerHTML = dayContent;

      // Add click event to show tasks for this day
      dayElement.addEventListener('click', () => {
        this.showDayTasks(dateStr);
      });

      grid.appendChild(dayElement);
    }

    // Add empty cells for days after month ends
    const totalCells = grid.children.length - 7; // Subtract header row
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        emptyDay.innerHTML = `<div class="calendar-day-number">${i}</div>`;
        grid.appendChild(emptyDay);
      }
    }

    // Update navigation event listeners
    document.getElementById('prev-month').onclick = () => {
      this.renderCalendarMonth(month - 1, year);
    };

    document.getElementById('next-month').onclick = () => {
      this.renderCalendarMonth(month + 1, year);
    };
  }

  showDayTasks(dateStr) {
    const dayTasks = this.tasks.filter(t => t.dueDate === dateStr);

    if (dayTasks.length === 0) {
      this.showToast('No tasks for this day');
      return;
    }

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'day-tasks-modal';

    const formattedDate = this.formatDate(dateStr);

    let tasksHtml = '';
    dayTasks.forEach(task => {
      const category = this.categories.find(c => c.id === task.category);
      const categoryClass = category ? `category-${category.id}` : '';

      tasksHtml += `
        <div class="task-card ${task.completed ? 'completed' : ''}">
          <div class="task-header">
            <span class="task-category ${categoryClass}">${category ? category.name : 'Uncategorized'}</span>
            <div class="task-actions">
              <button class="task-action-btn" onclick="app.toggleTaskComplete('${task.id}')">
                <i class="material-icons">${task.completed ? 'check_circle' : 'check_circle_outline'}</i>
              </button>
            </div>
          </div>
          <h3 class="task-title">${task.title}</h3>
          ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
          ${task.dueTime ? `
            <div class="task-due-date">
              <i class="material-icons">schedule</i>
              ${task.dueTime}
            </div>
          ` : ''}
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="modal-content task-detail-modal">
        <div class="modal-header">
          <h2 class="modal-title">Tasks for ${formattedDate}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${tasksHtml}
        </div>
      </div>
    `;

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

  renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    if (this.categories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="material-icons">category</i>
          <h3 data-i18n="categories.empty.title">No categories yet</h3>
          <p data-i18n="categories.empty.description">Create categories to organize your tasks</p>
          <button class="btn btn-primary" onclick="app.openCategoryModal()">
            <i class="material-icons">add</i>
            <span data-i18n="categories.add">Add Category</span>
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
    const completedCount = this.tasks.filter(t => t.category === category.id && t.completed).length;

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
        <div class="stat">
          <span class="stat-value">${taskCount}</span>
          <span class="stat-label" data-i18n="category.totalTasks">Total Tasks</span>
        </div>
        <div class="stat">
          <span class="stat-value">${completedCount}</span>
          <span class="stat-label" data-i18n="category.completed">Completed</span>
        </div>
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
      this.showToast('Please enter a category name', 'error');
      return;
    }

    if (categoryId) {
      // Update existing category
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        category.name = name;
        category.color = color;
      }
    } else {
      // Add new category
      const newCategory = {
        id: this.generateId(),
        name,
        color
      };

      this.categories.push(newCategory);
    }

    this.saveCategories();
    this.renderCategories();
    this.closeModal('category-modal');
    this.showToast(categoryId ? 'Category updated successfully' : 'Category added successfully');
  }

  editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category? Tasks in this category will be uncategorized.')) {
      // Update tasks with this category
      this.tasks.forEach(task => {
        if (task.category === categoryId) {
          task.category = '';
        }
      });

      // Remove category
      this.categories = this.categories.filter(c => c.id !== categoryId);

      this.saveCategories();
      this.saveTasks();
      this.renderCategories();
      this.renderTasks();
      this.showToast('Category deleted successfully');
    }
  }

  renderSettings() {
    // Update notification settings
    document.getElementById('enable-notifications').checked = this.notifications.enabled;
    document.getElementById('notification-sound').checked = this.notifications.sound;

    // Update backup settings
    document.getElementById('auto-backup').checked = this.backupSettings.auto;
    document.getElementById('backup-frequency').value = this.backupSettings.frequency;

    // Update last backup date
    this.updateBackupInfo();
  }

  updateBackupInfo() {
    const backupInfo = document.getElementById('last-backup-date');
    if (this.lastBackupDate) {
      backupInfo.textContent = this.formatDateTime(this.lastBackupDate);
    } else {
      backupInfo.textContent = 'Never';
    }
  }

  backupData() {
    const data = {
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

    // Convert to JSON string
    const json = JSON.stringify(data, null, 2);

    // Create blob
    const blob = new Blob([json], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;

    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

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
        const data = JSON.parse(e.target.result);

        // Restore data
        if (data.tasks) {
          this.tasks = data.tasks;
          this.saveTasks();
        }

        if (data.categories) {
          this.categories = data.categories;
          this.saveCategories();
        }

        if (data.settings) {
          if (data.settings.language) {
            this.setLanguage(data.settings.language);
          }

          if (data.settings.theme) {
            this.setTheme(data.settings.theme);
          }

          if (data.settings.notifications) {
            this.notifications = data.settings.notifications;
            this.saveNotifications();
          }

          if (data.settings.backupSettings) {
            this.backupSettings = data.settings.backupSettings;
            this.saveBackupSettings();
          }
        }

        // Update backup date from file
        if (data.backupDate) {
          this.lastBackupDate = data.backupDate;
          this.updateBackupInfo();
        }

        // Refresh UI
        this.renderView(this.currentView);

        this.showToast('Backup restored successfully');
      } catch (error) {
        this.showToast('Failed to restore backup', 'error');
        console.error('Restore backup error:', error);
      }
    };

    reader.readAsText(file);
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

    // Check if backup is due based on frequency
    let backupDue = false;

    switch (this.backupSettings.frequency) {
      case 'daily':
        backupDue = now.getDate() !== lastBackup.getDate() || 
                   now.getMonth() !== lastBackup.getMonth() || 
                   now.getFullYear() !== lastBackup.getFullYear();
        break;
      case 'weekly':
        const daysDiff = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
        backupDue = daysDiff >= 7;
        break;
      case 'monthly':
        backupDue = now.getMonth() !== lastBackup.getMonth() || 
                   now.getFullYear() !== lastBackup.getFullYear();
        break;
    }

    if (backupDue) {
      this.backupData();
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme icon
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(this.currentLang);
  }

  setLanguage(lang) {
    this.currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', lang);

    // Update language button
    document.getElementById('lang-text').textContent = lang === 'en' ? '🇺🇸' : '🇸🇦';

    // Update text content
    this.updateTextContent();
  }

  updateTextContent() {
    // Get translation strings
    const translations = this.getTranslations();

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        element.placeholder = translations[key];
      }
    });
  }

  getTranslations() {
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
        'settings.restore': 'Restore Backup',
        'settings.restoreDescription': 'Restore data from a backup file',
        'tasks.empty.title': 'No tasks yet',
        'tasks.empty.description': 'Create your first task to get started',
        'categories.empty.title': 'No categories yet',
        'categories.empty.description': 'Create categories to organize your tasks',
        'category.totalTasks': 'Total Tasks',
        'category.completed': 'Completed'
      },
      ar: {
        'app.title': 'مدير المهام',
        'user.greeting': 'أهلا بك',
        'nav.tasks': 'المهام',
        'nav.calendar': 'التقويم',
        'nav.categories': 'الفئات',
        'nav.settings': 'الإعدادات',
        'backup.manual': 'نسخ احتياطي الآن',
        'backup.last': 'آخر نسخة احتياطية:',
        'tasks.title': 'مهامي',
        'tasks.search': 'البحث عن المهام...',
        'filter.allCategories': 'جميع الفئات',
        'category.work': 'العمل',
        'category.personal': 'شخصي',
        'category.urgent': 'عاجل',
        'filter.allStatus': 'جميع الحالات',
        'status.pending': 'قيد الانتظار',
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
        'settings.restore': 'استعادة نسخة احتياطية',
        'settings.restoreDescription': 'استعادة البيانات من ملف نسخة احتياطية',
        'tasks.empty.title': 'لا توجد مهام بعد',
        'tasks.empty.description': 'أنشئ أول مهمة للبدء',
        'categories.empty.title': 'لا توجد فئات بعد',
        'categories.empty.description': 'أنشئ فئات لتنظيم مهامك',
        'category.totalTasks': 'إجمالي المهام',
        'category.completed': 'مكتمل'
      }
    };

    return translations[this.currentLang] || translations.en;
  }

  updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateElement.textContent = now.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
    }
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    if (type === 'error') {
      toast.style.backgroundColor = 'var(--error-color)';
      toast.style.color = 'white';
    }

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

  formatDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
  }

  formatDateTime(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const tasksJson = localStorage.getItem('tasks');
    if (tasksJson) {
      this.tasks = JSON.parse(tasksJson);
    }
  }

  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  loadCategories() {
    const categoriesJson = localStorage.getItem('categories');
    if (categoriesJson) {
      this.categories = JSON.parse(categoriesJson);
    }
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  saveBackupSettings() {
    localStorage.setItem('backupSettings', JSON.stringify(this.backupSettings));
  }
}
