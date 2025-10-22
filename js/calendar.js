
// Calendar module
class Calendar {
  constructor(tasks, container) {
    this.tasks = tasks;
    this.container = container;
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  render() {
    // Create calendar header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const header = document.createElement('div');
    header.className = 'calendar-header';

    header.innerHTML = `
      <div class="calendar-nav">
        <button id="prev-month"><i class="material-icons">chevron_left</i></button>
      </div>
      <h2 class="calendar-title">${monthNames[this.currentMonth]} ${this.currentYear}</h2>
      <div class="calendar-nav">
        <button id="next-month"><i class="material-icons">chevron_right</i></button>
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(header);

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
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day other-month';
      const prevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      emptyDay.innerHTML = `<div class="calendar-day-number">${prevMonth - firstDay + i + 1}</div>`;
      grid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';

      // Check if it's today
      const today = new Date();
      if (this.currentYear === today.getFullYear() && 
          this.currentMonth === today.getMonth() && 
          day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Format date for comparison
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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
        if (window.app) {
          window.app.showDayTasks(dateStr);
        }
      });

      grid.appendChild(dayElement);
    }

    this.container.appendChild(grid);

    // Add navigation event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
      this.previousMonth();
    });

    document.getElementById('next-month').addEventListener('click', () => {
      this.nextMonth();
    });
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.render();
  }

  updateTasks(tasks) {
    this.tasks = tasks;
    this.render();
  }
}
