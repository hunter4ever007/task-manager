// Language Manager Class
export class LanguageManager {
    constructor(app) {
        this.app = app;
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {},
            ar: {}
        };
    }

    // Initialize language manager
    init() {
        // Set initial language
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        // Apply translations
        this.applyTranslations();
        
        // Set up language toggle
        const languageToggle = document.getElementById('language-toggle');
        const mobileLanguageToggle = document.getElementById('mobile-language-toggle');
        
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }
        
        if (mobileLanguageToggle) {
            mobileLanguageToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Toggle between English and Arabic
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        
        // Update HTML attributes
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        // Apply translations
        this.applyTranslations();
        
        // Update calendar
        this.app.calendarManager.renderCalendar();
        
        // Update language toggle icon
        const languageToggleIcon = document.getElementById('language-toggle-icon');
        const mobileLanguageToggleIcon = document.getElementById('mobile-language-toggle-icon');
        
        if (languageToggleIcon) {
            languageToggleIcon.className = this.currentLanguage === 'ar' ? 'fas fa-language' : 'fas fa-language';
            languageToggleIcon.setAttribute('title', this.currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
        }
        
        if (mobileLanguageToggleIcon) {
            mobileLanguageToggleIcon.className = this.currentLanguage === 'ar' ? 'fas fa-language' : 'fas fa-language';
            mobileLanguageToggleIcon.setAttribute('title', this.currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
        }
    }

    // Apply translations to all elements with data-en and data-ar attributes
    applyTranslations() {
        const elements = document.querySelectorAll('[data-en], [data-ar]');
        
        elements.forEach(element => {
            const enText = element.getAttribute('data-en');
            const arText = element.getAttribute('data-ar');
            
            if (this.currentLanguage === 'en' && enText) {
                element.textContent = enText;
            } else if (this.currentLanguage === 'ar' && arText) {
                element.textContent = arText;
            }
        });
        
        // Update placeholders
        const placeholders = document.querySelectorAll('[data-en-placeholder], [data-ar-placeholder]');
        
        placeholders.forEach(element => {
            const enPlaceholder = element.getAttribute('data-en-placeholder');
            const arPlaceholder = element.getAttribute('data-ar-placeholder');
            
            if (this.currentLanguage === 'en' && enPlaceholder) {
                element.setAttribute('placeholder', enPlaceholder);
            } else if (this.currentLanguage === 'ar' && arPlaceholder) {
                element.setAttribute('placeholder', arPlaceholder);
            }
        });
    }

    // Translate a specific key
    translate(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

// Create service-worker-registration.js file
if (!document.getElementById('service-worker-registration-script')) {
    const serviceWorkerScript = document.createElement('script');
    serviceWorkerScript.id = 'service-worker-registration-script';
    serviceWorkerScript.textContent = `
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
    `;
    document.head.appendChild(serviceWorkerScript);
}

// Create service-worker.js file in the root directory
const serviceWorkerContent = `
// Service Worker for Task Management App
const CACHE_NAME = 'task-management-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/task-manager.js',
    '/js/ui-manager.js',
    '/js/storage-manager.js',
    '/js/notification-manager.js',
    '/js/calendar-manager.js',
    '/js/backup-manager.js',
    '/js/language-manager.js',
    '/js/service-worker-registration.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: 'View Task' },
            { action: 'close', title: 'Close' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        clients.openWindow('/');
    }
});
`;

// Create manifest.json file in the root directory
const manifestContent = `{
    "name": "Task Management App",
    "short_name": "Tasks",
    "description": "A modern task management application",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4a6cf7",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "dir": "auto",
    "lang": "en",
    "prefer_related_applications": false,
    "related_applications": [],
    "scope": "/"
}`;