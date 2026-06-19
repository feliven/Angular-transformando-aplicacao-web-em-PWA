import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import { ContextService, type ContextType } from '../../services/context.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-timer-control',
  imports: [FormsModule],
  templateUrl: './timer-control.html',
  styleUrl: './timer-control.scss',
})
export class TimerControl {
  private contextService = inject(ContextService);
  private audioService = inject(AudioService);
  private notificationService = inject(NotificationService);

  isTimerStarted = signal(false);
  timerInSeconds = signal(30);
  timerFormat = computed(() => {
    return new Date(this.timerInSeconds() * 1000).toLocaleTimeString('pt-Br', {
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    });
  });
  hasPlaySong = signal(false);

  private intervalId: any;

  context = this.contextService.contextSignal$;

  isFocoActive = computed(() => this.context() === 'foco');
  isDescansoCurtoActive = computed(() => this.context() === 'descanso-curto');
  isDescansoLongoActive = computed(() => this.context() === 'descanso-longo');

  constructor() {
    effect(() => {
      this.setTimerSecond();
    });
  }

  onStartClick(): void {
    this.intervalId = setInterval(() => {
      this.countdown();
    }, 1000);

    this.isTimerStarted.set(true);
    this.audioService.play('play');
  }

  onPauseClick(): void {
    this.isTimerStarted.set(false);
    clearInterval(this.intervalId);

    this.audioService.play('pause');
  }

  onChangeContext(context: ContextType): void {
    this.contextService.updateContext(context);
  }

  onToggleMusicClick(): void {
    this.hasPlaySong.update((value) => {
      const newValue = !value;
      if (newValue) {
        this.audioService.play('environment');
      } else {
        this.audioService.pause('environment');
      }
      return newValue;
    });
  }

  private countdown(): void {
    if (this.timerInSeconds() <= 0) {
      this.audioService.play('beep');

      this.resetTimer();
      this.setTimerSecond();

      this.sendNotification();

      return;
    }

    this.timerInSeconds.update((value) => {
      return value - 1;
    });
  }

  private resetTimer(): void {
    this.isTimerStarted.set(false);
    clearInterval(this.intervalId);
  }

  private setTimerSecond(): void {
    switch (this.context()) {
      case 'foco':
        this.timerInSeconds.set(30);
        break;
      case 'descanso-curto':
        this.timerInSeconds.set(5);
        break;
      case 'descanso-longo':
        this.timerInSeconds.set(15);
        break;
    }
  }

  private async sendNotification(): Promise<void> {
    try {
      await this.notificationService.requestPermission();

      const context = this.context();

      if (context.includes('descanso')) {
        this.notificationService.showNotification('Aviso', {
          body: 'Tempo de descanso finalizado!',
        });

        return;
      } else if (context === 'foco') {
        this.notificationService.showNotification('Aviso', {
          body: 'Tempo de foco finalizado!',
        });

        return;
      } else {
        this.notificationService.showNotification('Aviso', {
          body: 'Tempo finalizado!',
        });

        return;
      }
    } catch (error) {
      console.error('Erro ao enviar notificação', error);
    }
  }
}
