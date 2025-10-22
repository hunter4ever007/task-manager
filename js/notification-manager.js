// Notification Manager Class
export class NotificationManager {
    constructor(app) {
        this.app = app;
        this.notificationPermission = 'default';
        this.checkPermission();
        this.notificationCheckInterval = null;
    }

    // Check notification permission
    checkPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            
            if (this.notificationPermission === 'default') {
                // We'll request permission when user enables notifications for a task
            }
        }
    }

    // Request notification permission
    requestPermission() {
        return new Promise((resolve, reject) => {
            if (!('Notification' in window)) {
                reject('Notifications not supported');
                return;
            }
            
            Notification.requestPermission()
                .then(permission => {
                    this.notificationPermission = permission;
                    resolve(permission);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // Start checking for notifications
    startNotificationCheck() {
        // Clear any existing interval
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        // Check for notifications every minute
        this.notificationCheckInterval = setInterval(() => {
            this.checkNotifications();
        }, 60000); // 1 minute
    }

    // Check for due notifications
    checkNotifications() {
        const tasksWithDueNotifications = this.app.taskManager.getTasksWithDueNotifications();
        
        tasksWithDueNotifications.forEach(task => {
            this.showNotification(task);
        });
    }

    // Show notification for a task
    showNotification(task) {
        // First try browser notification API
        if (this.notificationPermission === 'granted') {
            this.showBrowserNotification(task);
        } else {
            // Fallback to in-app notification
            this.showInAppNotification(task);
        }
    }

    // Show browser notification
    showBrowserNotification(task) {
        const notification = new Notification('Task Reminder', {
            body: task.title,
            icon: '/images/icons/icon-192x192.png'
        });
        
        notification.onclick = () => {
            window.focus();
            this.app.uiManager.showTaskModal(task.id);
        };
        
        // Also show in-app notification
        this.showInAppNotification(task);
    }

    // Show in-app notification
    showInAppNotification(task) {
        const notificationModal = document.getElementById('notification-modal');
        const notificationTitle = document.getElementById('notification-title');
        const notificationMessage = document.getElementById('notification-message');
        
        // Set notification content
        notificationTitle.textContent = this.app.languageManager.getCurrentLanguage() === 'ar' ? 'تذكير بالمهمة' : 'Task Reminder';
        notificationMessage.textContent = task.title;
        
        // Show notification
        notificationModal.classList.add('show');
        
        // Play notification sound if available
        this.playNotificationSound();
        
        // Auto hide after 10 seconds
        setTimeout(() => {
            notificationModal.classList.remove('show');
        }, 10000);
    }

    // Play notification sound
    playNotificationSound() {
        // Create audio element
        const audio = new Audio('/sounds/notification.mp3');
        
        // Try to play the sound
        audio.play().catch(error => {
            console.log('Could not play notification sound:', error);
        });
    }
}