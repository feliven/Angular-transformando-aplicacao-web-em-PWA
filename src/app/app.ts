import { Component, signal } from '@angular/core';
import { Banner } from './shared/components/banner/banner';
import { Footer } from './shared/components/footer/footer';
import { Header } from './shared/components/header/header';
import { TaskManager } from './shared/components/task-manager/task-manager';
import { TimerControl } from './shared/components/timer-control/timer-control';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, Banner, TimerControl, TaskManager],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ng-fokus');
}
