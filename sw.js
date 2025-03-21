// Service Worker for Virtual Love Letter
const CACHE_NAME = 'virtual-love-letter-v1';
const STATIC_CACHE_NAME = 'virtual-love-letter-static-v1';
const IMAGE_CACHE_NAME = 'virtual-love-letter-images-v1';

// Core assets that should always be cached on install
const CORE_ASSETS = [
  './',
  './virtual-love-letter.html',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/photos/') || 
    url.pathname.includes('/photos/') ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  );
}

// Fetch event - serve from cache or network with dynamic caching
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle image requests with a cache-first strategy
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          // Return cached response if found
          if (response) {
            console.log('Serving image from cache:', request.url);
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              console.log('Caching new image:', request.url);
              // Clone the response before caching as it can only be used once
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('Fetch failed for image:', error);
            // Could return a fallback image here
          });
        });
      })
    );
  } 
  // Handle core assets with a cache-first strategy
  else {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache core assets
          return fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              // Only cache core assets and HTML/CSS/JS files
              if (
                CORE_ASSETS.includes(new URL(request.url).pathname) ||
                request.url.match(/\.(html|css|js)$/i)
              ) {
                cache.put(request, networkResponse.clone());
              }
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
