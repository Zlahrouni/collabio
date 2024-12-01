import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {CanActivateFn, Router} from "@angular/router";
import {map, take} from "rxjs";

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return router.createUrlTree(['/']);
      } else {
        return true;
      }
    })
  );
};
