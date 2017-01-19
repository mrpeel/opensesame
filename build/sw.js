/* global self, caches, Promise, fetch */

let staticCacheName = 'open-sesame-v1484813089577';
let preCache = [
  'lib/material.min.css',
  'lib/material.min.js',
  'css/opensesame.css',
  'scripts/os.js',
  'images/favicon.ico',
];
let opaqueCacheOnRequest = [
  'https://fonts.gstatic.com',
  'https://fonts.googleapis.com',
];

self.addEventListener('install', function(event) {
  // When cache is installed add everything in the pre-cache list
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(preCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  // On activation ,delet any previous version of the smes-otg cache
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('open-sesame-') && cacheName !==
            staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Check if URL is opaque and should be cached on request
  for (let prefixCounter = 0; prefixCounter <
    opaqueCacheOnRequest.length; prefixCounter++) {
    if (event.request.url.startsWith(opaqueCacheOnRequest[prefixCounter])) {
      opaqueCacheOnFirstRequest(event.request);
      break;
    }
  }

  /* The default behaviour is to check if it's in the cache, and either
    serve it from the cache or the network request */
  event.respondWith(checkCacheAndRespond(event.request));
});

/**
*  Checks cache for URL and if cached returns object, otherwise
*   returns URL fetch
* @param {Object} request
* @return {Object}
*/
function checkCacheAndRespond(request) {
  return caches.match(request).then(function(response) {
    return response || fetch(request);
  });
}

/**
*  Opaque URLs fail when attempting to work with the response object
*   so for these URLs, if they are not already cached, they are added with
*   a call to add
* @param {Object} request
* @return {Object}
*/
function opaqueCacheOnFirstRequest(request) {
  return caches.open(staticCacheName).then(function checkCache(cache) {
    cache.match(request).then(function(response) {
      if (!response) {
        cache.add(request.url);
      }
    });
  });
}


self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
