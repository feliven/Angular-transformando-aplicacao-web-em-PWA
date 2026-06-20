import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';

@Service()
export class ConnectivityService {
  private platformId = inject(PLATFORM_ID);

  private isBrowser = isPlatformBrowser(this.platformId);

  private isOnline = signal<boolean>(this.isBrowser ? navigator.onLine : true);

  constructor() {
    if (this.isBrowser) {
      window.addEventListener('online', () => {
        this.isOnline.set(true);
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
      });
    }
  }

  get isBrowserOnline() {
    return this.isOnline();
  }
}
