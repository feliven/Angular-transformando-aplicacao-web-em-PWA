import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import type { Observable } from 'rxjs';
import type { INotificationMessage } from '../types/types';

const UNSUPPORTED_MSG = 'Não há suporte para notificações.';

@Service()
export class NotificationService {
  readonly PUBLIC_KEY =
    'BI1OyoLDOFsq-JL6uA2mWUq6IXSzT0kTZskQ8yKqeg8yJNhv22YLPI0tNpprzWaUQ1_G4oGk3JQv_ngw4QrmybQ';
  private baseUrl = 'http://localhost:4000';

  private platformId = inject(PLATFORM_ID);
  private httpClient = inject(HttpClient);
  private swPush = inject(SwPush);

  constructor() {
    this.subscribeToNotifications();
  }

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

  subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.warn('Notificações estão desativadas');
      return;
    }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.PUBLIC_KEY,
      })
      .then((subscription) => {
        this.sendSubscriptionToServer(subscription).subscribe({
          next: () => console.log('Inscrição enviada ao servidor com sucesso.'),
          error: (err) => console.error('Erro ao enviar inscrição ao servidor', err),
        });
      })
      .catch((error) => {
        console.error('Erro ao assinar notificações:', error);
      });
  }

  private sendSubscriptionToServer(
    subscription: PushSubscription,
  ): Observable<INotificationMessage> {
    return this.httpClient.post<INotificationMessage>(`${this.baseUrl}/subscribe`, subscription);
  }

  private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
  }
}
