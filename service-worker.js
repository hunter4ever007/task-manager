
// Service Worker for Task Manager PWA
const CACHE_NAME = 'task-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/calendar.css',
  '/js/app.js',
  '/js/app-continued.js',
  '/js/app-final.js',
  '/js/translations.js',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install event - open a cache and add all the essential files to it
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  console.log('Service Worker: Fetching ', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // If the request is in the cache, return it
        if (response) {
          console.log('Service Worker: Serving from cache');
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Background sync for backup
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-backup') {
    console.log('Service Worker: Background sync for backup');
    event.waitUntil(doBackgroundBackup());
  }
});

// Function to perform background backup
function doBackgroundBackup() {
  // This would implement the backup logic
  // For now, just log that it was triggered
  console.log('Service Worker: Performing background backup');
  return Promise.resolve();
}

// Push notification event
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push received');

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: 'icons/icon-96x96.png',
    badge: 'icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: 'images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Task Manager', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
