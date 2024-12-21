import {Injectable} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';
import {doc, Firestore, getDoc} from '@angular/fire/firestore';
import {Dialog} from '@angular/cdk/dialog';
import {UsernameDialogComponent} from '../components/shared/username-dialog/username-dialog.component';
import {BehaviorSubject, firstValueFrom, map, Observable, take} from 'rxjs';
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = user(this.auth);
  private currentUserData$ = new BehaviorSubject<any>(null);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private dialog: Dialog,
    private readonly userService: UserService
  ) {
    this.user$.subscribe(async (user) => {
      if (user) {
        const userData = await firstValueFrom(this.userService.getUserByIdDoc(user.uid));
        this.currentUserData$.next(userData);
      } else {
        this.currentUserData$.next(null);
      }
    });
  }

  getCurrentUserData$(): Observable<any> {
    return this.currentUserData$.asObservable();
  }


  isConnected(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  // Connexion avec Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const userExist = await firstValueFrom(this.userService.getUserByIdDoc(result.user.uid));

      let userData;
      if (!userExist) {
        const username = await this.showUsernameDialog();
        if (!username) {
          await this.logout();
          throw new Error('Username is required to complete registration');
        }
        userData = await firstValueFrom(this.userService.addUser(result.user.uid, username, result.user.email!));
      } else {
        userData = userExist;
      }

      this.userService.saveUserToLocalStorage(userData);
      this.currentUserData$.next(userData);  // Emit the new user data
      return userData;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }



  private async showUsernameDialog() {
    const dialogRef = this.dialog.open<string>(UsernameDialogComponent);
    return firstValueFrom(dialogRef.closed);
  }

  // Connexion avec email/password
  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  // Inscription
  async register(email: string, password: string, username: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return await firstValueFrom(this.userService.addUser(result.user.uid, username, email));
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      await signOut(this.auth);
      this.currentUserData$.next(null);  // Clear the user data
      this.userService.removeUserFromLocalStorage();
    } catch (error) {
      throw error;
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.auth.currentUser;
  }
}
