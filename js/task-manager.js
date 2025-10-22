// Task Manager Class
export class TaskManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.tasks = [];
        this.categories = [
            { id: 'work', name: 'Work', color: '#4CAF50' },
            { id: 'personal', name: 'Personal', color: '#2196F3' },
            { id: 'urgent', name: 'Urgent', color: '#F44336' }
        ];
    }

    // Get all tasks
    getTasks() {
        return this.tasks;
    }

    // Set tasks (used when loading from storage)
    setTasks(tasks) {
        this.tasks = tasks || [];
    }

    // Get all categories
    getCategories() {
        return this.categories;
    }

    // Set categories (used when loading from storage)
    setCategories(categories) {
        this.categories = categories || [
            { id: 'work', name: 'Work', color: '#4CAF50' },
            { id: 'personal', name: 'Personal', color: '#2196F3' },
            { id: 'urgent', name: 'Urgent', color: '#F44336' }
        ];
    }

    // Add a new task
    addTask(taskData) {
        const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description || '',
            category: taskData.category,
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            dueTime: taskData.dueTime || null,
            notification: taskData.notification || false,
            notificationTime: taskData.notificationTime || 0,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.storageManager.saveTasks(this.tasks);
        return newTask;
    }

    // Update an existing task
    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const updatedTask = {
                ...this.tasks[taskIndex],
                title: taskData.title,
                description: taskData.description || '',
                category: taskData.category,
                priority: taskData.priority || 'medium',
                dueDate: taskData.dueDate || null,
                dueTime: taskData.dueTime || null,
                notification: taskData.notification || false,
                notificationTime: taskData.notificationTime || 0,
                updatedAt: new Date().toISOString()
            };

            this.tasks[taskIndex] = updatedTask;
            this.storageManager.saveTasks(this.tasks);
            return updatedTask;
        }
        
        return null;
    }

    // Delete a task
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            this.storageManager.saveTasks(this.tasks);
            return true;
        }
        
        return false;
    }

    // Toggle task completion status
    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            this.storageManager.saveTasks(this.tasks);
            return this.tasks[taskIndex];
        }
        
        return null;
    }

    // Get a task by ID
    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }

    // Get tasks by category
    getTasksByCategory(categoryId) {
        return this.tasks.filter(task => task.category === categoryId);
    }

    // Get tasks by completion status
    getTasksByCompletionStatus(completed) {
        return this.tasks.filter(task => task.completed === completed);
    }

    // Get tasks due today
    getTodayTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate.getTime() === today.getTime();
        });
    }

    // Get upcoming tasks (due in the future)
    getUpcomingTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate.getTime() > today.getTime();
        });
    }

    // Get tasks by due date
    getTasksByDueDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate.getTime() === targetDate.getTime();
        });
    }

    // Search tasks by title or description
    searchTasks(query) {
        if (!query) return this.tasks;
        
        const searchTerm = query.toLowerCase();
        
        return this.tasks.filter(task => {
            return (
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        });
    }

    // Sort tasks by different criteria
    sortTasks(tasks, sortBy) {
        const sortedTasks = [...tasks];
        
        switch (sortBy) {
            case 'date-asc':
                sortedTasks.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'date-desc':
                sortedTasks.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate) - new Date(a.dueDate);
                });
                break;
            case 'priority-desc':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                sortedTasks.sort((a, b) => {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                break;
            case 'priority-asc':
                const priorityOrderAsc = { high: 3, medium: 2, low: 1 };
                sortedTasks.sort((a, b) => {
                    return priorityOrderAsc[a.priority] - priorityOrderAsc[b.priority];
                });
                break;
            default:
                // Default sort by creation date (newest first)
                sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sortedTasks;
    }

    // Filter tasks by different criteria
    filterTasks(tasks, filterBy) {
        switch (filterBy) {
            case 'pending':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }

    // Calculate progress percentage
    calculateProgress() {
        if (this.tasks.length === 0) return 0;
        
        const completedTasks = this.tasks.filter(task => task.completed).length;
        return Math.round((completedTasks / this.tasks.length) * 100);
    }

    // Add a new category
    addCategory(categoryData) {
        const newCategory = {
            id: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
            name: categoryData.name,
            color: categoryData.color || '#4CAF50'
        };

        this.categories.push(newCategory);
        this.storageManager.saveCategories(this.categories);
        return newCategory;
    }

    // Delete a category
    deleteCategory(categoryId) {
        const categoryIndex = this.categories.findIndex(category => category.id === categoryId);
        
        if (categoryIndex !== -1) {
            // Remove the category
            this.categories.splice(categoryIndex, 1);
            this.storageManager.saveCategories(this.categories);
            
            // Update tasks with this category to have no category
            this.tasks.forEach(task => {
                if (task.category === categoryId) {
                    task.category = '';
                }
            });
            this.storageManager.saveTasks(this.tasks);
            
            return true;
        }
        
        return false;
    }

    // Get tasks with notifications due
    getTasksWithDueNotifications() {
        const now = new Date();
        
        return this.tasks.filter(task => {
            if (!task.notification || task.completed) return false;
            if (!task.dueDate || !task.dueTime) return false;
            
            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            const notificationTime = new Date(dueDateTime.getTime() - (task.notificationTime * 60 * 1000));
            
            // Check if notification time is now (within a 1-minute window)
            const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
            return timeDiff < 60000; // 1 minute in milliseconds
        });
    }
}