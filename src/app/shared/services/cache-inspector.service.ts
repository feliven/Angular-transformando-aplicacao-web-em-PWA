import { Service } from '@angular/core';

@Service()
export class CacheInspectorService {
  async checkImagesSoundsCache() {
    if (typeof caches === 'undefined') {
      return;
    }
    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        if (cacheName.includes('ngsw')) {
          const cache = await caches.open(cacheName);
          const cachedRequests = await cache.keys();

          console.log(`Cache encontrado: ${cacheName}`);
          console.log('Assets em cache:');

          cachedRequests
            .filter((request) => {
              return request.url.includes('/images') || request.url.includes('/sounds');
            })
            .forEach((request) => {
              console.log(` - ${new URL(request.url).pathname}`);
            });
        }
      }
    } catch (error) {
      console.error('Erro ao obter cache:', error);
    }
  }
}
