import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { ServiceWorkerModule } from '@angular/service-worker';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServiceWorkerModule.register('', { enabled: false })],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
