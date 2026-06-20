import { TestBed } from '@angular/core/testing';

import { IndexedDBService } from './indexed-db.service';
import 'fake-indexeddb/auto';

describe('IndexedDBService', () => {
  let service: IndexedDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
