
# Task Manager - Daily Tasks

A professional full-screen Task Management Web Application with modern design, PWA capabilities, and multi-language support.

## Features

### Core Features
- Task management: Add, edit, delete, and mark tasks as completed
- Categorization: Group tasks by category (Work, Personal, Urgent, etc.)
- Scheduling: Set due dates and times for each task
- Reminders + Notifications: Browser notifications and sound alerts
- Search and filter: By category, date, or completion status
- Calendar view: Display upcoming tasks visually
- Progress bar: Show completion percentage
- Dark / Light mode toggle
- Persistent data: All tasks saved using LocalStorage

### Local Backup System
- Manual backup: Export data as JSON file
- Automatic backup: Set frequency (daily, weekly, monthly)
- Restore data from previous backup files
- Clear status messages for backup/restore operations

### Multi-Language Support
- Full bilingual support (Arabic / English)
- Instant language switching
- Automatic RTL/LTR text direction switching
- All UI elements dynamically updated

### Mobile + Responsive Design
- Fully responsive layout for all devices
- Bottom navigation bar for mobile devices
- Touch-friendly buttons and interactions
- Adaptive layouts using CSS Grid and Flexbox

### PWA + Full-Screen Mode
- Progressive Web App with manifest.json
- Service worker for offline access and caching
- iOS and Android meta tags for full-screen mode
- Installable on home screen

## Project Structure

```
Daily_tasks/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for PWA
├── css/
│   ├── styles.css          # Main styles
│   └── calendar.css        # Calendar-specific styles
├── js/
│   ├── app.js              # Main application logic
│   ├── app-continued.js    # Continued application logic
│   ├── app-final.js        # Final part of application logic
│   └── translations.js     # Language translations
├── icons/                  # App icons (add your icons here)
├── sounds/                 # Sound files (add notification sounds here)
└── screenshots/            # Screenshots for PWA (add your screenshots here)
```

## Getting Started

1. **Add Icons**: Place app icons in the `icons/` directory:
   - icon-16x16.png
   - icon-32x32.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

2. **Add Sounds**: Place notification sound files in the `sounds/` directory:
   - notification.mp3

3. **Add Screenshots**: Add app screenshots in the `screenshots/` directory for PWA showcase:
   - desktop-1.png
   - mobile-1.png

4. **Host the Application**: Deploy the files to a web server or run locally using a simple HTTP server.

5. **Install as PWA**: Open the app in a browser, then use the "Add to Home Screen" option to install it as a PWA.

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## Technologies Used

- HTML5
- CSS3 with custom properties
- Vanilla JavaScript (ES6+)
- Progressive Web App (PWA)
- LocalStorage API
- Notification API
- Service Workers

## License

MIT License
