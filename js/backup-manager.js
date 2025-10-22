// Backup Manager Class
export class BackupManager {
    constructor(app) {
        this.app = app;
    }

    // Backup data to a JSON file
    backupData() {
        try {
            // Get data from storage manager
            const data = this.app.storageManager.exportData();
            
            // Create a blob with the data
            const blob = new Blob([data], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `taskmaster_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Update last backup date
            const settings = this.app.storageManager.getSettings();
            settings.lastBackupDate = new Date().toISOString();
            this.app.storageManager.saveSettings(settings);
            
            // Update last backup date display
            document.getElementById('last-backup-date').textContent = new Date().toLocaleString();
            if (document.getElementById('mobile-last-backup-date')) {
                document.getElementById('mobile-last-backup-date').textContent = new Date().toLocaleString();
            }
            
            // Show success message
            this.app.uiManager.showToast('success', this.app.languageManager.getCurrentLanguage() === 'ar' ? 'تم النسخ الاحتياطي بنجاح' : 'Backup successful');
            
            return true;
        } catch (error) {
            console.error('Error backing up data:', error);
            this.app.uiManager.showToast('error', this.app.languageManager.getCurrentLanguage() === 'ar' ? 'فشل النسخ الاحتياطي' : 'Backup failed');
            return false;
        }
    }

    // Restore data from a JSON file
    restoreData(file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const jsonData = event.target.result;
                const success = this.app.storageManager.importData(jsonData);
                
                if (success) {
                    // Reload data
                    this.app.loadData();
                    
                    // Refresh UI
                    this.app.uiManager.initUI();
                    this.app.calendarManager.renderCalendar();
                    
                    // Show success message
                    this.app.uiManager.showToast('success', this.app.languageManager.getCurrentLanguage() === 'ar' ? 'تمت استعادة البيانات بنجاح' : 'Data restored successfully');
                } else {
                    // Show error message
                    this.app.uiManager.showToast('error', this.app.languageManager.getCurrentLanguage() === 'ar' ? 'فشل استعادة البيانات' : 'Failed to restore data');
                }
            } catch (error) {
                console.error('Error restoring data:', error);
                this.app.uiManager.showToast('error', this.app.languageManager.getCurrentLanguage() === 'ar' ? 'فشل استعادة البيانات' : 'Failed to restore data');
            }
        };
        
        reader.readAsText(file);
    }

    // Set auto backup frequency
    setAutoBackupFrequency(frequency) {
        const settings = this.app.storageManager.getSettings();
        settings.autoBackupFrequency = frequency;
        this.app.storageManager.saveSettings(settings);
    }

    // Check if auto backup is due
    checkAutoBackup() {
        const settings = this.app.storageManager.getSettings();
        
        if (settings.autoBackupFrequency === 'never') {
            return;
        }
        
        const lastBackupDate = settings.lastBackupDate ? new Date(settings.lastBackupDate) : null;
        const now = new Date();
        
        if (!lastBackupDate) {
            // No previous backup, do one now
            this.backupData();
            return;
        }
        
        let backupDue = false;
        
        switch (settings.autoBackupFrequency) {
            case 'daily':
                // Check if last backup was more than 24 hours ago
                backupDue = (now.getTime() - lastBackupDate.getTime()) > (24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                // Check if last backup was more than 7 days ago
                backupDue = (now.getTime() - lastBackupDate.getTime()) > (7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                // Check if last backup was more than 30 days ago
                backupDue = (now.getTime() - lastBackupDate.getTime()) > (30 * 24 * 60 * 60 * 1000);
                break;
        }
        
        if (backupDue) {
            this.backupData();
        }
    }
}