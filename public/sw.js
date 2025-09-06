// Service Worker for DocifyByMe
const CACHE_NAME = 'docifybyme-v1.0.0'
const STATIC_CACHE = 'docifybyme-static-v1.0.0'
const DYNAMIC_CACHE = 'docifybyme-dynamic-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/login',
  '/dashboard',
  '/about',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/vendors-5ada35ad8cb763fa.js',
  '/favicon.ico'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('.')) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Handle page requests
  event.respondWith(handlePageRequest(request))
})

async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Offline - Please check your connection' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleStaticRequest(request) {
  // Try cache first for static assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Not found', { status: 404 })
  }
}

async function handlePageRequest(request) {
  try {
    // Try network first for pages
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/')
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered')
}

