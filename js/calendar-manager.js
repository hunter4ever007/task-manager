// Calendar Manager Class
export class CalendarManager {
    constructor(app) {
        this.app = app;
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
    }

    // Initialize calendar
    initCalendar() {
        this.renderCalendar();
    }

    // Render calendar for current month
    renderCalendar() {
        const calendarDays = document.getElementById('calendar-days');
        const monthYearText = document.getElementById('calendar-month-year');
        
        // Clear calendar days
        calendarDays.innerHTML = '';
        
        // Set month and year text
        const monthNames = this.app.languageManager.getCurrentLanguage() === 'ar' ? 
            ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] :
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthYearText.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Get first day of month and total days in month
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Get days from previous month
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        // Get all tasks
        const tasks = this.app.taskManager.getTasks();
        
        // Calculate total cells needed (previous month days + current month days + next month days)
        const totalCells = 42; // 6 rows x 7 days
        
        // Create calendar cells
        for (let i = 0; i < totalCells; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            let day;
            let month = this.currentMonth;
            let year = this.currentYear;
            
            // Previous month days
            if (i < firstDay) {
                day = daysInPrevMonth - (firstDay - i - 1);
                dayCell.classList.add('other-month');
                month = this.currentMonth - 1;
                if (month < 0) {
                    month = 11;
                    year = this.currentYear - 1;
                }
            }
            // Next month days
            else if (i >= firstDay + daysInMonth) {
                day = i - (firstDay + daysInMonth) + 1;
                dayCell.classList.add('other-month');
                month = this.currentMonth + 1;
                if (month > 11) {
                    month = 0;
                    year = this.currentYear + 1;
                }
            }
            // Current month days
            else {
                day = i - firstDay + 1;
                
                // Check if it's today
                const today = new Date();
                if (day === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear()) {
                    dayCell.classList.add('today');
                }
            }
            
            // Set day number
            dayCell.textContent = day;
            
            // Check if there are tasks for this day
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksForDay = tasks.filter(task => task.dueDate === dateString);
            
            if (tasksForDay.length > 0) {
                dayCell.classList.add('has-tasks');
                
                // Add click event to show tasks for this day
                dayCell.addEventListener('click', () => {
                    this.showTasksForDate(dateString);
                });
            }
            
            calendarDays.appendChild(dayCell);
        }
    }

    // Go to previous month
    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    // Go to next month
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
    }

    // Show tasks for a specific date
    showTasksForDate(dateString) {
        // Get tasks for this date
        const tasksForDate = this.app.taskManager.getTasksByDueDate(dateString);
        
        if (tasksForDate.length > 0) {
            // Format date for display
            const date = new Date(dateString);
            const formattedDate = date.toLocaleDateString(this.app.languageManager.getCurrentLanguage() === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Update view title
            document.getElementById('view-title').textContent = formattedDate;
            
            // Clear tasks container except for empty state
            const tasksContainer = document.getElementById('tasks-container');
            Array.from(tasksContainer.children).forEach(child => {
                if (!child.classList.contains('empty-state')) {
                    tasksContainer.removeChild(child);
                }
            });
            
            // Hide empty state
            document.getElementById('empty-state').style.display = 'none';
            
            // Render tasks for this date
            tasksForDate.forEach(task => {
                const taskCard = this.app.uiManager.createTaskCard(task);
                tasksContainer.appendChild(taskCard);
            });
        }
    }
}