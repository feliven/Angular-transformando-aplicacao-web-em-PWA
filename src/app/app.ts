import { Component, effect, inject, type OnInit } from '@angular/core';
import { Banner } from './shared/components/banner/banner';
import { Footer } from './shared/components/footer/footer';
import { Header } from './shared/components/header/header';
import { TaskManager } from './shared/components/task-manager/task-manager';
import { TimerControl } from './shared/components/timer-control/timer-control';
import { UpdateService } from './shared/services/update.service';
import { ConnectivityService } from './shared/services/connectivity.service';
import { NotificationService } from './shared/services/notification.service';
import { CacheInspectorService } from './shared/services/cache-inspector.service';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, Banner, TimerControl, TaskManager],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private updateService = inject(UpdateService);
  private notificationService = inject(NotificationService);
  private connectivityService = inject(ConnectivityService);
  private cacheInspectorService = inject(CacheInspectorService);
  private hasUpdate: boolean = false;

  constructor() {
    effect(() => {
      const isOnline = this.connectivityService.isBrowserOnline;

      if (!isOnline) {
        this.notificationService.showNotification('Você está offline', {
          body: '📵',
        });
      } else {
        this.notificationService.showNotification('Você está online', {
          body: '📡',
        });
      }
    });
  }

  ngOnInit(): void {
    this.hasUpdateChecker();

    if (this.hasUpdate) {
      console.log('Atualização encontrada durante a inicialização');
    }

    this.cacheInspectorService.checkImagesSoundsCache();
  }

  async hasUpdateChecker(): Promise<void> {
    this.hasUpdate = await this.updateService.checkForUpdate();
  }
}
