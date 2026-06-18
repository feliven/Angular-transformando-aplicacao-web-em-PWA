import { inject, Service } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter, interval, tap } from 'rxjs';

@Service()
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  constructor() {
    this.initializeUpdateChecks();
  }

  initializeUpdateChecks(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    interval(60 * 1000).subscribe(() => {
      this.checkForUpdate();
    });

    this.swUpdate.versionUpdates
      .pipe(
        tap((event) => {
          console.log(event);
        }),
        filter((event) => {
          return event.type === 'VERSION_READY';
        }),
      )
      .subscribe(() => {
        this.promptUserToUpdate();
      });

    this.swUpdate.unrecoverable.subscribe(() => {
      alert('Devido a um erro, esta página será recarregada...');
      window.location.reload();
    });
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      return await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error(error);
      throw new Error(`Erro ao verificar atualizações: ${error}`);
    }
  }

  promptUserToUpdate(): void {
    if (confirm('Há uma atualização disponível para este aplicativo!')) {
      this.swUpdate
        .activateUpdate()
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error('Erro ao atualizar:', error);
        });
    }
  }
}
