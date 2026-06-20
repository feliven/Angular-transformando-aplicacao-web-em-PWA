import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Service()
export class IndexedDBService {
  private readonly db$ = new BehaviorSubject<IDBDatabase | null>(null);
  private readonly store = { name: 'task', key: 'uuid' };
  private dbReady$ = new BehaviorSubject(false);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser) {
      this.initDB();
    }
  }

  initDB(): void {
    const request = indexedDB.open('TaskManagerDB', 1);

    request.onupgradeneeded = (event) => {
      const openRequest = event.target as IDBOpenDBRequest;
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(this.store.name)) {
        db.createObjectStore(this.store.name, {
          keyPath: this.store.key,
        });
      }

      request.onsuccess = (event) => {
        const openRequest = event.target as IDBOpenDBRequest;
        const db = openRequest.result;
        this.db$.next(db);
        this.dbReady$.next(true);
      };
    };
  }
}
