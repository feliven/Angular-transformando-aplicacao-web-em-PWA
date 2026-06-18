import { Component, inject, type OnInit } from '@angular/core';
import { Banner } from './shared/components/banner/banner';
import { Footer } from './shared/components/footer/footer';
import { Header } from './shared/components/header/header';
import { TaskManager } from './shared/components/task-manager/task-manager';
import { TimerControl } from './shared/components/timer-control/timer-control';
import { UpdateService } from './shared/services/update.service';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, Banner, TimerControl, TaskManager],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private updateService = inject(UpdateService);
  private hasUpdate: boolean = false;

  ngOnInit(): void {
    this.hasUpdateChecker();

    if (this.hasUpdate) {
      console.log('Atualização encontrada durante a inicialização');
    }
  }

  async hasUpdateChecker(): Promise<void> {
    this.hasUpdate = await this.updateService.checkForUpdate();
  }
}
