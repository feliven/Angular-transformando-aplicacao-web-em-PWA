import { TestBed } from '@angular/core/testing';

import { UpdateService } from './update.service';
import { ServiceWorkerModule } from '@angular/service-worker';

describe('UpdateService', () => {
  let service: UpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServiceWorkerModule.register('', { enabled: false })],
    });
    service = TestBed.inject(UpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
