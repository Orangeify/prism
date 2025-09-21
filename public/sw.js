// Try to import Ultraviolet scripts. If any import fails, log the error and fall back
// to a safe pass-through service worker so registration can succeed.
let __UV_IMPORT_OK = false;
try {
    //The UV bundle. It contains most of the code for ultraviolet to function properly.
    importScripts('/uv/uv.bundle.js');
    //our uv.config.js that we just made a few steps ago
    importScripts('/uv/uv.config.js');
    //the actual Ultraviolet service worker. Needed for UV to function properly.
    importScripts(__uv$config.sw || '/uv/uv.sw.js');
    __UV_IMPORT_OK = true;
} catch (err) {
    // Import failure will prevent SW from registering; log a helpful error and continue
    // with a safe pass-through fetch handler below.
    console.error('Ultraviolet import failed in service worker:', err);
}

// Ensure the service worker takes control immediately after installation/activation
// so fetch interception for /uv/service/* works without requiring a manual reload.
if (self && typeof self.skipWaiting === 'function') {
    try { self.skipWaiting(); } catch (e) { /* ignore */ }
}

self.addEventListener('activate', function(event) {
    try {
        event.waitUntil((async () => {
            if (self.clients && typeof self.clients.claim === 'function') {
                await self.clients.claim();
            }
        })());
    } catch (e) { /* ignore */ }
});

if (__UV_IMPORT_OK) {
    // create the uv service worker and proxy requests
    try {
        const uv = new UVServiceWorker();
        self.addEventListener('fetch', function (event) {
            try {
                if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
                    event.respondWith((async function () { return await uv.fetch(event); })());
                } else {
                    event.respondWith((async function () { return await fetch(event.request); })());
                }
            } catch (e) {
                // If uv.fetch throws, fall back to network
                event.respondWith(fetch(event.request));
            }
        });
    } catch (err) {
        console.error('Failed to initialize UVServiceWorker:', err);
        // fall through to pass-through handler below
        self.addEventListener('fetch', function (event) {
            event.respondWith(fetch(event.request));
        });
    }
} else {
    // Import failed: simple pass-through so SW registration succeeds and requests go to network.
    self.addEventListener('fetch', function (event) {
        event.respondWith(fetch(event.request));
    });
}
