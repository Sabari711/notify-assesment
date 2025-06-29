import { Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const userAuthGuard: CanActivateFn = (route, state) => {
  let router = Inject(Router);

  let userToken = localStorage.getItem('userToken');
  if (userToken) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
