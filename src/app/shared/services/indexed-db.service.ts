import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { BehaviorSubject, filter, Observable, switchMap, take } from 'rxjs';
import { AES, enc } from 'crypto-js';
import type { TaskItem } from '../types/types';

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
    };

    request.onsuccess = (event) => {
      const openRequest = event.target as IDBOpenDBRequest;
      const db = openRequest.result;
      this.db$.next(db);
      this.dbReady$.next(true);
    };
  }

  private waitForDB(): Observable<boolean> {
    return this.dbReady$.pipe(
      filter((ready) => {
        return ready;
      }),
      take(1),
    );
  }

  private get store$(): IDBObjectStore {
    if (!this.isBrowser) {
      throw new Error('IndexedDB está disponível apenas em navegadores');
    }

    const db = this.db$.getValue();
    const dbTransaction = db?.transaction(this.store.name, 'readwrite');
    const objStore = dbTransaction?.objectStore(this.store.name);

    return (
      objStore ??
      (() => {
        throw new Error('DB não foi inicializado');
      })()
    );
  }

  addTask(task: TaskItem): Observable<TaskItem> {
    return this.waitForDB().pipe(
      switchMap(() => {
        return new Observable<TaskItem>((obs) => {
          const req = this.store$.add(task);

          req.onsuccess = () => {
            obs.next(task);
            obs.complete();
          };

          req.onerror = () => {
            obs.error('Falha ao adicionar tarefa');
          };
        });
      }),
    );
  }

  listAllTasks(): Observable<TaskItem[]> {
    return this.waitForDB().pipe(
      switchMap(() => {
        return new Observable<TaskItem[]>((obs) => {
          const req = this.store$.getAll();

          req.onsuccess = () => {
            obs.next(req.result as TaskItem[]);
            obs.complete();
          };

          req.onerror = () => {
            obs.error('Falha ao listar tarefas');
          };
        });
      }),
    );
  }
}
