const ver = 'v1.1.2'
const expectedCaches = [ver]
const cacheList = []

// install
self.addEventListener('install', event => {
  console.log(`${ver} is installing…`);

  // // cache something
  // event.waitUntil(
  //   caches.open(ver).then(cache => {
  //     cache.addAll(cacheList)
  //   })
  // );

  self.skipWaiting()
});

// activate
self.addEventListener('activate', event => {
  console.log('now ready to handle fetches!', event);

  // event.waitUntil(
  //   caches.keys().then(keys => Promise.all(
  //     keys.map(key => {
  //       if (!expectedCaches.includes(key)) {
  //         return caches.delete(key);
  //       }
  //     })
  //   )).then(() => {
  //     console.log(`activate waitUntil: ${ver}`)
  //   })
  // )

});

// fetch
self.addEventListener('fetch', event => {
  // 看來是放在 worker 內的 request 都會經過這個 Function
  // console.log('now fetch!', event);
  // const url = new URL(event.request.url);
  // cacheList.forEach(name => {
  //   checkCache(event, url, name)
  // })
});

function checkCache(event, url, name) {
  if (url.origin === location.origin && url.pathname === name)
    return event.respondWith(caches.match(name))
}