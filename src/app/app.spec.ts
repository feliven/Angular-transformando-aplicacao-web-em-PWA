import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
import 'fake-indexeddb/auto';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, ServiceWorkerModule.register('', { enabled: false })],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
