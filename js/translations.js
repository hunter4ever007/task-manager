
// Translation module for Task Manager
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
    'form.taskTitle': 'Task Title',
    'form.taskDescription': 'Description',
    'form.category': 'Category',
    'form.dueDate': 'Due Date',
    'form.dueTime': 'Due Time',
    'form.notifications': 'Enable Notifications',
    'form.categoryName': 'Category Name',
    'form.categoryColor': 'Color',

    // Days
    'day.sunday': 'Sunday',
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',

    // Months
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December'
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
    'tasks.search': 'البحث عن مهام...',
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
    'settings.enableNotifications': 'تفعيل الإشعارات',
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
    'form.taskTitle': 'عنوان المهمة',
    'form.taskDescription': 'الوصف',
    'form.category': 'الفئة',
    'form.dueDate': 'تاريخ الاستحقاق',
    'form.dueTime': 'وقت الاستحقاق',
    'form.notifications': 'تفعيل الإشعارات',
    'form.categoryName': 'اسم الفئة',
    'form.categoryColor': 'اللون',

    // Days
    'day.sunday': 'الأحد',
    'day.monday': 'الإثنين',
    'day.tuesday': 'الثلاثاء',
    'day.wednesday': 'الأربعاء',
    'day.thursday': 'الخميس',
    'day.friday': 'الجمعة',
    'day.saturday': 'السبت',

    // Months
    'month.january': 'يناير',
    'month.february': 'فبراير',
    'month.march': 'مارس',
    'month.april': 'أبريل',
    'month.may': 'مايو',
    'month.june': 'يونيو',
    'month.july': 'يوليو',
    'month.august': 'أغسطس',
    'month.september': 'سبتمبر',
    'month.october': 'أكتوبر',
    'month.november': 'نوفمبر',
    'month.december': 'ديسمبر'
  }
};

// Function to get translation
function getTranslation(key, lang = 'en') {
  return translations[lang] && translations[lang][key] 
    ? translations[lang][key] 
    : key;
}
