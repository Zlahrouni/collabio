import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {CanActivateFn, Router} from "@angular/router";
import {map, take} from "rxjs";
import {ProjectService} from "./project.service";

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

export const ProjectExistsGuard: CanActivateFn = (route, state) => {
  const projectService = inject(ProjectService);
  const router = inject(Router);
  const projectId = route.paramMap.get('id');
  if (!projectId) {
    console.log('No project ID provided')
    return router.createUrlTree(['/']);
  }

  return projectService.getProjectById(projectId).pipe(
    take(1),
    map(project => {
      if (project) {
        return true;
      } else {
        return router.createUrlTree(['/']);
      }
    })
  );
};
