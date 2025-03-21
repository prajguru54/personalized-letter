// Service Worker for Virtual Love Letter
const CACHE_NAME = 'virtual-love-letter-v1';
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
    url.pathname.includes('/photos/') || 
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
    // Match your actual image filenames
    url.pathname.match(/(20241214|20250114|20250202|20250112|20250315|20250125|20250309|20250201|20250216|20250214|20250208|20250206|20250301)_\d+\.jpg$/i)
  );
}

// Fetch event - serve from cache or network with dynamic caching
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Create a URL object for easier parsing
  const url = new URL(request.url);
  
  // Skip requests that aren't from our origin or GitHub Pages domain
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('github.io') && 
      !url.hostname.includes('localhost')) {
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
