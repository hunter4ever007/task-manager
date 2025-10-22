// UI Manager Class
export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'all';
        this.editingTaskId = null;
    }

    // Initialize the UI
    initUI() {
        this.renderCategories();
        this.renderTasks();
        this.updateProgressBar();
    }

    // Render all tasks based on current view, sort, and filter
    renderTasks() {
        const tasksContainer = document.getElementById('tasks-container');
        const emptyState = document.getElementById('empty-state');
        let tasks = [];
        
        // Get tasks based on current view
        switch (this.currentView) {
            case 'today':
                tasks = this.app.taskManager.getTodayTasks();
                break;
            case 'upcoming':
                tasks = this.app.taskManager.getUpcomingTasks();
                break;
            case 'completed':
                tasks = this.app.taskManager.getTasksByCompletionStatus(true);
                break;
            default:
                tasks = this.app.taskManager.getTasks();
        }
        
        // Apply search filter if there's a search query
        const searchInput = document.getElementById('search-input');
        if (searchInput.value.trim()) {
            tasks = this.app.taskManager.searchTasks(searchInput.value.trim());
        }
        
        // Apply sort
        const sortSelect = document.getElementById('sort-select');
        tasks = this.app.taskManager.sortTasks(tasks, sortSelect.value);
        
        // Apply filter
        const filterSelect = document.getElementById('filter-select');
        tasks = this.app.taskManager.filterTasks(tasks, filterSelect.value);
        
        // Clear tasks container except for empty state
        Array.from(tasksContainer.children).forEach(child => {
            if (!child.classList.contains('empty-state')) {
                tasksContainer.removeChild(child);
            }
        });
        
        // Show empty state if no tasks
        if (tasks.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            
            // Render each task
            tasks.forEach(task => {
                const taskCard = this.createTaskCard(task);
                tasksContainer.appendChild(taskCard);
            });
        }
        
        // Update progress bar
        this.updateProgressBar();
    }

    // Create a task card element
    createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'task-completed' : ''}`;
        taskCard.setAttribute('data-task-id', task.id);
        
        // Find category
        const category = this.app.taskManager.getCategories().find(cat => cat.id === task.category) || { name: '', color: '#999' };
        
        // Format due date and time
        let dueDateText = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDateText = dueDate.toLocaleDateString();
            
            if (task.dueTime) {
                const dueTime = task.dueTime;
                dueDateText += ` ${dueTime}`;
            }
        }
        
        // Priority indicator
        const priorityClass = `priority-${task.priority}`;
        
        taskCard.innerHTML = `
            <div class="task-priority ${priorityClass}"></div>
            <div class="task-header">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} />
                </div>
                <div>
                    <h3 class="task-title">${task.title}</h3>
                    ${category.name ? `<span class="task-category" style="background-color: ${category.color}20; color: ${category.color}">${category.name}</span>` : ''}
                </div>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-meta">
                ${dueDateText ? `
                <div class="task-due-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${dueDateText}</span>
                </div>` : ''}
                ${task.notification ? '<i class="fas fa-bell" title="Notification enabled"></i>' : ''}
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskCard.querySelector('.task-checkbox input');
        checkbox.addEventListener('change', () => {
            this.toggleTaskCompletion(task.id);
        });
        
        const editBtn = taskCard.querySelector('.task-action-btn.edit');
        editBtn.addEventListener('click', () => {
            this.showTaskModal(task.id);
        });
        
        const deleteBtn = taskCard.querySelector('.task-action-btn.delete');
        deleteBtn.addEventListener('click', () => {
            this.deleteTask(task.id);
        });
        
        return taskCard;
    }

    // Render categories in sidebar and task form
    renderCategories() {
        const categoriesList = document.getElementById('categories-list');
        const taskCategorySelect = document.getElementById('task-category');
        const categories = this.app.taskManager.getCategories();
        
        // Clear existing categories
        categoriesList.innerHTML = '';
        taskCategorySelect.innerHTML = '<option value="">None</option>';
        
        // Render each category
        categories.forEach(category => {
            // Add to sidebar list
            const categoryItem = document.createElement('li');
            categoryItem.setAttribute('data-category-id', category.id);
            categoryItem.innerHTML = `
                <span class="category-color" style="background-color: ${category.color}"></span>
                <span>${category.name}</span>
            `;
            categoryItem.addEventListener('click', () => {
                this.filterTasksByCategory(category.id);
            });
            categoriesList.appendChild(categoryItem);
            
            // Add to task form select
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            taskCategorySelect.appendChild(option);
        });
    }

    // Filter tasks by category
    filterTasksByCategory(categoryId) {
        // Highlight selected category
        document.querySelectorAll('#categories-list li').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category-id') === categoryId) {
                item.classList.add('active');
            }
        });
        
        // Update view title
        const category = this.app.taskManager.getCategories().find(cat => cat.id === categoryId);
        if (category) {
            document.getElementById('view-title').textContent = category.name;
        }
        
        // Filter tasks
        const tasksContainer = document.getElementById('tasks-container');
        const emptyState = document.getElementById('empty-state');
        
        // Clear tasks container except for empty state
        Array.from(tasksContainer.children).forEach(child => {
            if (!child.classList.contains('empty-state')) {
                tasksContainer.removeChild(child);
            }
        });
        
        // Get tasks for this category
        const tasks = this.app.taskManager.getTasksByCategory(categoryId);
        
        // Show empty state if no tasks
        if (tasks.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            
            // Render each task
            tasks.forEach(task => {
                const taskCard = this.createTaskCard(task);
                tasksContainer.appendChild(taskCard);
            });
        }
    }

    // Update progress bar
    updateProgressBar() {
        const progressPercentage = this.app.taskManager.calculateProgress();
        document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
    }

    // Show task modal (for add or edit)
    showTaskModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('task-form');
        const saveBtn = form.querySelector('.save-btn');
        
        // Reset form
        form.reset();
        document.getElementById('notification-time').disabled = true;
        
        if (taskId) {
            // Edit mode
            this.editingTaskId = taskId;
            const task = this.app.taskManager.getTaskById(taskId);
            
            if (task) {
                modalTitle.setAttribute('data-en', 'Edit Task');
                modalTitle.setAttribute('data-ar', 'تعديل المهمة');
                modalTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'تعديل المهمة' : 'Edit Task';
                
                saveBtn.setAttribute('data-en', 'Update Task');
                saveBtn.setAttribute('data-ar', 'تحديث المهمة');
                saveBtn.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'تحديث المهمة' : 'Update Task';
                
                // Fill form with task data
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-description').value = task.description || '';
                document.getElementById('task-category').value = task.category || '';
                document.getElementById('task-priority').value = task.priority || 'medium';
                document.getElementById('task-due-date').value = task.dueDate || '';
                document.getElementById('task-due-time').value = task.dueTime || '';
                document.getElementById('task-notification').checked = task.notification || false;
                document.getElementById('notification-time').disabled = !task.notification;
                document.getElementById('notification-time').value = task.notificationTime || 0;
            }
        } else {
            // Add mode
            this.editingTaskId = null;
            modalTitle.setAttribute('data-en', 'Add New Task');
            modalTitle.setAttribute('data-ar', 'إضافة مهمة جديدة');
            modalTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'إضافة مهمة جديدة' : 'Add New Task';
            
            saveBtn.setAttribute('data-en', 'Save Task');
            saveBtn.setAttribute('data-ar', 'حفظ المهمة');
            saveBtn.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'حفظ المهمة' : 'Save Task';
        }
        
        // Show modal
        modal.classList.add('show');
    }

    // Show category modal
    showCategoryModal() {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        
        // Reset form
        form.reset();
        document.getElementById('category-color').value = '#4CAF50';
        
        // Show modal
        modal.classList.add('show');
    }

    // Handle task form submission
    handleTaskFormSubmit() {
        const form = document.getElementById('task-form');
        
        // Get form data
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value,
            dueTime: document.getElementById('task-due-time').value,
            notification: document.getElementById('task-notification').checked,
            notificationTime: parseInt(document.getElementById('notification-time').value, 10)
        };
        
        if (this.editingTaskId) {
            // Update existing task
            this.app.taskManager.updateTask(this.editingTaskId, taskData);
            this.showToast('success', 'Task updated successfully');
        } else {
            // Add new task
            this.app.taskManager.addTask(taskData);
            this.showToast('success', 'Task added successfully');
        }
        
        // Close modal
        document.getElementById('task-modal').classList.remove('show');
        
        // Refresh tasks
        this.renderTasks();
        
        // Update calendar
        this.app.calendarManager.renderCalendar();
    }

    // Handle category form submission
    handleCategoryFormSubmit() {
        const form = document.getElementById('category-form');
        
        // Get form data
        const categoryData = {
            name: document.getElementById('category-name').value,
            color: document.getElementById('category-color').value
        };
        
        // Add new category
        this.app.taskManager.addCategory(categoryData);
        
        // Close modal
        document.getElementById('category-modal').classList.remove('show');
        
        // Refresh categories
        this.renderCategories();
        
        this.showToast('success', 'Category added successfully');
    }

    // Toggle task completion status
    toggleTaskCompletion(taskId) {
        const task = this.app.taskManager.toggleTaskCompletion(taskId);
        
        if (task) {
            // Update task card
            const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
            if (taskCard) {
                if (task.completed) {
                    taskCard.classList.add('task-completed');
                } else {
                    taskCard.classList.remove('task-completed');
                }
            }
            
            // Update progress bar
            this.updateProgressBar();
            
            // Refresh tasks if in completed view
            if (this.currentView === 'completed') {
                this.renderTasks();
            }
        }
    }

    // Delete a task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const success = this.app.taskManager.deleteTask(taskId);
            
            if (success) {
                // Remove task card
                const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
                if (taskCard) {
                    taskCard.remove();
                }
                
                // Update progress bar
                this.updateProgressBar();
                
                // Update calendar
                this.app.calendarManager.renderCalendar();
                
                this.showToast('success', 'Task deleted successfully');
                
                // Show empty state if no tasks left
                const tasksContainer = document.getElementById('tasks-container');
                if (tasksContainer.querySelectorAll('.task-card').length === 0) {
                    document.getElementById('empty-state').style.display = 'flex';
                }
            }
        }
    }

    // Change current view
    changeView(view) {
        this.currentView = view;
        
        // Update active menu item
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === view) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === view) {
                item.classList.add('active');
            }
        });
        
        // Update view title
        const viewTitle = document.getElementById('view-title');
        switch (view) {
            case 'today':
                viewTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'مهام اليوم' : 'Today\'s Tasks';
                break;
            case 'upcoming':
                viewTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks';
                break;
            case 'completed':
                viewTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'المهام المكتملة' : 'Completed Tasks';
                break;
            case 'categories':
                viewTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'التصنيفات' : 'Categories';
                break;
            default:
                viewTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'جميع المهام' : 'All Tasks';
        }
        
        // Render tasks for this view
        this.renderTasks();
    }

    // Handle search
    handleSearch(query) {
        this.renderTasks();
    }

    // Show toast notification
    showToast(type, message) {
        const toastContainer = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
            case 'info':
                icon = 'info-circle';
                break;
        }
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-text">
                <p>${message}</p>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
    }
}