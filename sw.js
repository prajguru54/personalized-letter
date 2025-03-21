// Service Worker for Virtual Love Letter
const CORE_CACHE_NAME = 'virtual-love-letter-core-v1';
const STATIC_CACHE_NAME = 'virtual-love-letter-static-v1';
const IMAGE_CACHE_NAME = 'virtual-love-letter-images-v1';

// Get the repository name for GitHub Pages
function getRepoPath() {
  const path = self.location.pathname;
  const pathParts = path.split('/');
  // Remove the sw.js part and empty parts
  const filteredParts = pathParts.filter(part => part && part !== 'sw.js');
  
  if (filteredParts.length > 0) {
    // Return the repository path with leading and trailing slashes
    return '/' + filteredParts.join('/') + '/';
  }
  return '/'; // Default if not in a subdirectory
}

// The repository path for GitHub Pages (e.g., '/repo-name/')
const REPO_PATH = getRepoPath();

// Core assets that should always be cached on install
const CORE_ASSETS = [
  REPO_PATH,
  REPO_PATH + 'virtual-love-letter.html',
  REPO_PATH + 'index.html',
  REPO_PATH + 'manifest.json',
  REPO_PATH + 'sw.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CORE_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll([
          '/',
          '/index.html',
          '/virtual-love-letter.html',
          '/styles.css',
          '/script.js',
          '/manifest.json',
          '/favicon.ico'
        ]);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== CORE_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Helper function to determine if a request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/photos/') || 
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
    // Match your actual image filenames - include the new image
    url.pathname.match(/(20241214|20250114|20250202|20250112|20250315|20250125|20250309|20250201|20250216|20250214|20250208|20250206|20250301|20250118)_\d+\.jpg$/i)
  );
}

// Helper function to log detailed information about a request
function logRequestDetails(request, source) {
  const url = new URL(request.url);
  console.log(`[SW] ${source} - URL: ${url.href}`);
  console.log(`[SW] ${source} - Path: ${url.pathname}`);
  console.log(`[SW] ${source} - Origin: ${url.origin}`);
  console.log(`[SW] ${source} - Is Image: ${isImageRequest(request)}`);
}

// Fetch event - serve from cache or network with dynamic caching
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Log all image requests for debugging
  if (isImageRequest(request)) {
    console.log(`[Service Worker] Fetching image: ${request.url}`);
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests that aren't from our origin or GitHub Pages domain
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('github.io') && 
      !url.hostname.includes('localhost')) {
    return;
  }
  
  // Log request details for debugging
  logRequestDetails(request, 'Fetch Event');
  
  // For image requests, use a cache-first strategy
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME)
        .then(cache => {
          return cache.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log(`[Service Worker] Serving image from cache: ${request.url}`);
                return cachedResponse;
              }

              console.log(`[Service Worker] Image not in cache, fetching from network: ${request.url}`);
              return fetch(request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.ok) {
                    console.log(`[Service Worker] Caching new image: ${request.url}`);
                    // Clone the response before caching it
                    const clonedResponse = networkResponse.clone();
                    cache.put(request, clonedResponse);
                    return networkResponse;
                  }
                  
                  console.error(`[Service Worker] Failed to fetch image: ${request.url}`);
                  // If the image can't be fetched, return a placeholder
                  return fetch('/placeholder.jpg')
                    .catch(() => {
                      // If even the placeholder fails, return an SVG placeholder
                      return new Response(
                        `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" preserveAspectRatio="none">
                          <rect width="150" height="150" fill="#373940"></rect>
                          <text x="50" y="80" fill="#999">Image Error</text>
                        </svg>`,
                        { 
                          headers: { 'Content-Type': 'image/svg+xml' } 
                        }
                      );
                    });
                })
                .catch(error => {
                  console.error(`[Service Worker] Error fetching image: ${request.url}`, error);
                  // Return a placeholder image for network errors
                  return new Response(
                    `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" preserveAspectRatio="none">
                      <rect width="150" height="150" fill="#373940"></rect>
                      <text x="50" y="80" fill="#999">Network Error</text>
                    </svg>`,
                    { 
                      headers: { 'Content-Type': 'image/svg+xml' } 
                    }
                  );
                });
            });
        })
    );
    return;
  }
  // Handle core assets with a cache-first strategy
  else {
    event.respondWith(
      caches.open(CORE_CACHE_NAME).then(cache => {
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
                CORE_ASSETS.some(asset => new URL(request.url).pathname.endsWith(asset)) ||
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
