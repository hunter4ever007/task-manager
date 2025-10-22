
// Notifications module
class Notifications {
  constructor() {
    this.enabled = false;
    this.soundEnabled = true;
    this.soundFile = 'sounds/notification.mp3';
    this.checkInterval = null;
  }

  init() {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        });
      }
    }

    // Load settings from storage
    this.loadSettings();
  }

  loadSettings() {
    const settings = storage.getSettings();
    this.enabled = settings.notifications.enabled;
    this.soundEnabled = settings.notifications.sound;

    if (this.enabled) {
      this.startReminderCheck();
    }
  }

  updateSettings(enabled, soundEnabled) {
    this.enabled = enabled;
    this.soundEnabled = soundEnabled;

    if (enabled) {
      this.startReminderCheck();
    } else {
      this.stopReminderCheck();
    }

    // Save to storage
    const settings = storage.getSettings();
    settings.notifications = { enabled, sound: soundEnabled };
    storage.saveSettings(settings);
  }

  startReminderCheck() {
    // Check for due tasks every minute
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkDueTasks();
    }, 60000);
  }

  stopReminderCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  checkDueTasks() {
    const tasks = storage.getTasks();
    const now = new Date();

    tasks.forEach(task => {
      if (task.completed || !task.dueDate || !task.reminder || task.reminder === 'none') return;

      const dueDate = new Date(`${task.dueDate}T${task.dueTime || '00:00'}`);
      const reminderTime = this.calculateReminderTime(dueDate, task.reminder);
      const timeDiff = reminderTime - now;

      // Notify if it's time for the reminder (within 1 minute)
      if (timeDiff > 0 && timeDiff < 60000) {
        this.sendNotification(task);
      }
    });
  }

  calculateReminderTime(dueDate, reminder) {
    switch (reminder) {
      case 'ontime':
        return dueDate;
      case '5min':
        return new Date(dueDate.getTime() - 5 * 60000);
      case '15min':
        return new Date(dueDate.getTime() - 15 * 60000);
      case '30min':
        return new Date(dueDate.getTime() - 30 * 60000);
      case '1hour':
        return new Date(dueDate.getTime() - 60 * 60000);
      case '1day':
        return new Date(dueDate.getTime() - 24 * 60 * 60000);
      default:
        return dueDate;
    }
  }

  sendNotification(task) {
    if (!this.enabled) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Task Reminder', {
        body: `Your task "${task.title}" is due soon!`,
        icon: 'icons/icon-96x96.png',
        tag: task.id
      });

      notification.onclick = () => {
        // Focus or open the app
        window.focus();
        notification.close();
      };

      if (this.soundEnabled) {
        this.playSound();
      }
    }
  }

  playSound() {
    try {
      const audio = new Audio(this.soundFile);
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
}

// Initialize notifications
const notifications = new Notifications();
