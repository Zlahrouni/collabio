import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {CanActivateFn, Router} from "@angular/router";
import {firstValueFrom, map, switchMap, take} from "rxjs";
import {ProjectService} from "./project.service";
import {UsernameDialogComponent} from "../components/shared/username-dialog/username-dialog.component";
import {UserService} from "./user.service";
import {Dialog} from "@angular/cdk/dialog";

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);
  const dialog = inject(Dialog);

  return authService.user$.pipe(
    take(1),
    switchMap(async (user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      // Check local storage first
      const localUser = userService.getLocalUser();
      if (localUser?.username) {
        return true;
      }

      // If not in local storage, check database
      try {
        const dbUser = await firstValueFrom(userService.getUserByIdDoc(user.uid));

        if (dbUser?.username) {
          // Save to local storage if found in DB
          userService.saveUserToLocalStorage(dbUser);
          return true;
        }

        // If no username in DB, show dialog
        const dialogRef = dialog.open<string>(UsernameDialogComponent, {
          disableClose: true
        });

        const username = await firstValueFrom(dialogRef.closed);

        if (!username) {
          await authService.logout();
          return router.createUrlTree(['/login']);
        }

        // Save new username
        const updatedUser = await firstValueFrom(userService.addUser(user.uid, username, user.email!));
        userService.saveUserToLocalStorage(updatedUser);

        return true;
      } catch (error) {
        console.error('Error in auth guard:', error);
        await authService.logout();
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
  console.log('Project ID:', projectId)
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
