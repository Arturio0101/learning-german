// Установка сервис-воркера и кэширование основных ресурсов
self.addEventListener('install', (event) => {
  console.log('Service Worker: установка начата');
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      console.log('Service Worker: кэширование ресурсов');
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        "images/image1.jpg",
    "images/image2.jpg",
    "images/image3.jpg",
    "images/image4.jpg",
    "images/image5.jpg",
    "images/image6.jpg",
    "images/image7.jpg",
    "images/image8.jpg",
    "images/image9.jpg",
    "images/image10.jpg",
    "images/image11.png",
    "images/image12.png",
    "images/image13.png",
    "images/image14.jpg",
    "images/image15.jpg",
    "images/image16.jpg",
    "images/image17.jpg",
    "images/image18.jpg",
    "images/image19.jpg",
       // Добавьте другие ресурсы, которые должны кэшироваться
      ]);
    }).catch((error) => {
      console.error('Service Worker: ошибка кэширования ресурсов:', error);
    })
  );
});

// Активация сервис-воркера
self.addEventListener('activate', (event) => {
  console.log('Service Worker: активация завершена');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== 'my-cache' && cache !== 'api-cache') {
            console.log('Service Worker: удаление устаревшего кэша:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Обработка запросов с кэшированием данных API
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: получен запрос:', event.request.url);

  if (event.request.url.includes('/words')) {
    console.log('Service Worker: API-запрос обнаружен:', event.request.url);
    event.respondWith(
      caches.open('api-cache').then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              console.log('Service Worker: ответ от API получен, кэширование:', event.request.url);
              cache.put(event.request, response.clone())
                .then(() => console.log('Service Worker: ответ успешно сохранен в кэш для:', event.request.url))
                .catch((err) => console.error('Service Worker: ошибка при кэшировании ответа:', err));
            } else {
              console.warn('Service Worker: ответ от API не успешен (код состояния):', response.status);
            }
            return response;
          })
          .catch((error) => {
            console.warn('Service Worker: ошибка сети, попытка получить данные из кэша:', error);
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Service Worker: возвращены данные из кэша для:', event.request.url);
                return cachedResponse;
              }
              console.error('Service Worker: данные в кэше отсутствуют для:', event.request.url);
              return new Response('Нет соединения и данных в кэше.', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: ответ из кэша для:', event.request.url);
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open('my-cache').then((cache) => {
            console.log('Service Worker: кэширование нового ресурса:', event.request.url);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch((error) => {
        console.error('Service Worker: ошибка получения ресурса:', error);
        return new Response('Ошибка сети', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
  }
});

const CACHE_NAME = 'api-cache-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка начата');
  event.waitUntil(self.skipWaiting()); // Пропустить стадию ожидания, чтобы активировать сразу
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация завершена');
  event.waitUntil(self.clients.claim()); // Немедленно взять под управление
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker: получен запрос:', event.request.url);

  if (event.request.url.includes('/words')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            console.log('Service Worker: ответ от API, кэширование:', event.request.url);
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            console.log('Service Worker: возвращены данные из кэша для:', event.request.url);
            return cache.match(event.request);
          });
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});