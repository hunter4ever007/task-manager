// Service Worker for Task Management App
const CACHE_NAME = 'task-management-app-v1';
const urlsToCache = [
    '/task-manager/',
    '/task-manager/index.html',
    '/task-manager/css/styles.css',
    '/task-manager/js/app.js',
    '/task-manager/js/task-manager.js',
    '/task-manager/js/ui-manager.js',
    '/task-manager/js/storage-manager.js',
    '/task-manager/js/notification-manager.js',
    '/task-manager/js/calendar-manager.js',
    '/task-manager/js/backup-manager.js',
    '/task-manager/js/language-manager.js',
    '/task-manager/js/service-worker-registration.js',
    '/task-manager/manifest.json',
    '/task-manager/icons/icon-192x192.png',
    '/task-manager/icons/icon-512x512.png',
    '/task-manager/icons/favicon.ico'
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