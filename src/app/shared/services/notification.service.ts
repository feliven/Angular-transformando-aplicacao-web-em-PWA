import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';

const UNSUPPORTED_MSG = 'Não há suporte para notificações.';

@Service()
export class NotificationService {
  platformId = inject(PLATFORM_ID);

  requestPermission(): Promise<NotificationPermission> {
    if (!this.notificationSupported) {
      return Promise.reject(UNSUPPORTED_MSG);
    }

    return window.Notification.requestPermission();
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.notificationSupported) {
      console.warn(UNSUPPORTED_MSG);
      return;
    }

    if (window.Notification.permission === 'granted') {
      new window.Notification(title, options);
    } else {
      console.warn(UNSUPPORTED_MSG);
    }
  }

  private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
  }
}
