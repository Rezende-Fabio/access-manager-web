import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { SystemService } from '../services/system';

export const setupGuard: CanActivateFn = () => {
  const systemService = inject(SystemService);
  const router = inject(Router);

  return systemService.isInitialized().pipe(
    map(initialized => {
      if (initialized) {
        return router.createUrlTree(['/index']);
      }
      return true;
    })
  );
};

export const initializedGuard: CanActivateFn = () => {
  const systemService = inject(SystemService);
  const router = inject(Router);

  return systemService.isInitialized().pipe(
    map(initialized => {
      if (!initialized) {
        return router.createUrlTree(['/setup']);
      }
      return true;
    })
  );
};
