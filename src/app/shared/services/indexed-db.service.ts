import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { BehaviorSubject, filter, Observable, switchMap, take } from 'rxjs';
import { AES, enc } from 'crypto-js';
import type { EncryptedTaskItem, TaskItem } from '../types/types';
import { environment } from '../../../environments/environment';

@Service()
export class IndexedDBService {
  private readonly secretKey = environment.secretKey;

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

  private encrypt(data: unknown): string {
    if (this.secretKey) {
      return AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    }
    throw new Error('Chave secreta vazia ou não encontrada');
  }

  private decrypt(data: string): unknown {
    if (!data) throw new Error('Dados vazios para descriptografia');

    if (this.secretKey) {
      try {
        const bytes = AES.decrypt(data, this.secretKey).toString(enc.Utf8);
        if (!bytes) {
          throw new Error('Descriptografia retornou vazio; chave pode estar incorreta');
        }
        return JSON.parse(bytes);
      } catch (error) {
        console.error('Erro na descriptografia:', error);
        throw new Error('Falha ao descriptografar os dados');
      }
    }
    throw new Error('Chave secreta vazia ou não encontrada');
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
          const encryptedTask: EncryptedTaskItem = {
            uuid: task.uuid,
            encryptedData: this.encrypt({ ...task }),
          };

          console.log({ encryptedTask });

          const req = this.store$.add(encryptedTask);

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
            obs.next(
              (() => {
                const results = req.result as unknown[];
                const tasks: TaskItem[] = [];

                for (let i = 0; i < results.length; i++) {
                  const element = results[i];
                  const taskItem = this.handleTaskDecryption(element);
                  if (taskItem) {
                    tasks.push(taskItem);
                  }
                }

                return tasks;
              })(),
            );
            obs.complete();
          };

          req.onerror = () => {
            obs.error('Falha ao listar tarefas');
          };
        });
      }),
    );
  }

  private handleTaskDecryption(element: unknown): TaskItem | undefined {
    if (element && typeof element === 'object') {
      // O TypeScript agora sabe que element é um object.
      // Usamos o operador `in` para checar as chaves seguramente:
      if ('encryptedData' in element && typeof element.encryptedData === 'string') {
        try {
          const decryptedData = this.decrypt(element.encryptedData) as TaskItem;
          return decryptedData;
        } catch (error) {
          console.error('Ignorando tarefa corrompida/antiga:', element);
        }
      } else if ('uuid' in element && !('encryptedData' in element)) {
        // Tarefa antiga salva antes da implementação da criptografia
        return element as TaskItem;
      } else {
        console.error('Erro desconhecido');
      }
    }
    return undefined;
  }
}
