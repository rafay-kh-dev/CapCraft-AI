self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (e) => {
  // Yeh khali function browser ko batata hai ke app PWA requirements poori karti hai
});