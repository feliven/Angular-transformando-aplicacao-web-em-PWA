import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import { ContextService, type ContextType } from '../../services/context.service';

@Component({
  selector: 'app-timer-control',
  imports: [FormsModule],
  templateUrl: './timer-control.html',
  styleUrl: './timer-control.scss',
})
export class TimerControl {
  private contextService = inject(ContextService);
  private audioService = inject(AudioService);

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
    if (this.hasPlaySong()) {
      this.audioService.play('environment');
      return;
    }

    this.audioService.stop('environment');
    this.hasPlaySong.update((value) => {
      const newValue = !value;
      newValue ? this.audioService.play('environment') : this.audioService.stop('environment');
      return newValue;
    });
  }

  private countdown(): void {
    if (this.timerInSeconds() <= 0) {
      this.audioService.play('beep');

      this.resetTimer();
      this.setTimerSecond();

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
}
