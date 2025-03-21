// Service Worker for Virtual Love Letter
const VERSION = '2.0.0'; // No caching version
console.log(`[Service Worker] Version ${VERSION} starting - No Caching Mode`);

// This service worker does not cache anything
// It only logs requests for debugging purposes

// Helper function to log detailed information about a request
function logRequestDetails(request, source) {
  const url = new URL(request.url);
  console.log(`[Service Worker] ${source} - Request details:`, {
    url: request.url,
    method: request.method,
    pathname: url.pathname,
    origin: url.origin,
    headers: [...request.headers].map(([key, value]) => `${key}: ${value}`).join(', ')
  });
}

// Helper function to determine if a request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i);
}

// Install event - no caching
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker - No Caching Mode');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - no cache cleanup needed
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker - No Caching Mode');
  
  // Claim clients immediately
  event.waitUntil(clients.claim());
});

// Fetch event - no caching, just pass through to network
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Log image requests for debugging
  if (isImageRequest(request)) {
    console.log(`[Service Worker] Fetching image: ${request.url}`);
  }
  
  // Log request details for debugging
  logRequestDetails(request, 'Fetch Event');
  
  // No caching, just pass through to network
  // No need to call event.respondWith()
});
