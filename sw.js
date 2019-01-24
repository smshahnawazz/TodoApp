/* cache names */
let static_cache = "static-v2";
let dynamic_cache = "dynamic-v2"

/* files to be cached */
let cached_files = [
    './',
    './index.html',
    './JS/app.js',
    './JS/bootstrap.min.js',
    './JS/jquery.js',
    './JS/popper.js',
    './css/bootstrap.min.css',
    './css/style.css',

];
/* install event of service worker */
self.addEventListener('install', function (event) {
    console.log("[service worker] - install event");
    event.waitUntil(
        caches.open(static_cache)
            .then(function (cache) {
                cache.addAll(cached_files);
            })
    );
})

/* activate event of service worker */
self.addEventListener("activate", function (event) {
    console.log("[service worker] - activate event triggered.");
    event.waitUntil(
        caches.keys()
            .then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (thisCache) {
                        if (thisCache != static_cache) {
                            return caches.delete(thisCache);
                        }
                    })
                )
                console.log("[service Worker] - irrelevant caches delete.");
            })
    );
})

/* fetch event of service worker */
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                else {
                    fetch(event.request)
                        .then(function (res) {
                            caches.open(dynamic_cache)
                                .then(function (cache) {
                                    cache.put(event.request, res.clone())
                                })
                            return res;
                        })
                        .catch(function () {
                            console.log("Failed to fetch resources from the internet.");
                        });
                }
            })
    );
})