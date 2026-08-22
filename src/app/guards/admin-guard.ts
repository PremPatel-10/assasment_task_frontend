import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

// Mirrors the backend: reads are open to any authenticated user, writes require the Admin role
// (see [Authorize(Roles = "Admin")] on the write endpoints in ItemController/OrderController/
// OrderDetailController).
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (authService.isAdmin()) {
    return true;
  }

  alert('Admin access required');
  return router.createUrlTree(['/']);
};
