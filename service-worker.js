const CACHE_NAME = "skamdelima-v14";

const BASE = "/skamdelima/";

const APP_FILES = [
  BASE,
  BASE + "index.html",
  BASE + "style.css",
  BASE + "app.js",
  BASE + "manifest.json",
  BASE + "assets/logo.png",
  BASE + "assets/icon-192.png",
  BASE + "assets/icon-512.png"
];


// INSTALL
self.addEventListener("install", event => {

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();

});


// ACTIVATE
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      )

    )

  );

  self.clients.claim();

});


// FETCH
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url =
    new URL(event.request.url);


  // Jangan cache Google Apps Script API
  if (
    url.hostname === "script.google.com" ||
    url.hostname === "script.googleusercontent.com"
  ) {
    return;
  }


  event.respondWith(

    fetch(event.request)

      .then(response => {

        const copy =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {
            cache.put(
              event.request,
              copy
            );
          });

        return response;

      })

      .catch(() =>
        caches.match(event.request)
      )

  );

});
