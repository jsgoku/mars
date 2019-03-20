/**
 * @file service-worker.js with workbox api
 * @desc [example](https://workbox-samples.glitch.me/examples/workbox-sw/)
 * @author james-cain(m15960192140@163.com)
 */

/* globals Workbox */

workbox.core.setCacheNameDetails({
    prefix: 'mars-mobile-cache',
    suffix: 'v1',
    precache: 'install-time',
    runtime: 'run-time',
    googleAnalytics: 'ga'
});

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

/**
 * example runningCache with resources from CDN
 * including maxAge, maxEntries
 * cacheableResponse is important for CDN
 */
// workbox.routing.registerRoute(/^https:\/\/cdn\.baidu\.com/i,
//     workbox.strategies.cacheFirst({
//         cacheName: 'reyshieh-cache-images',
//         plugins: [
//             new workbox.expiration.Plugin({
//                 maxEntries: 100,
//                 maxAgeSeconds: 7 * 24 * 60 *60
//             }),
//             new workbox.cacheableResponse.Plugin({
//                 statuses: [0, 200]
//             })
//         ]
//     })
// );
