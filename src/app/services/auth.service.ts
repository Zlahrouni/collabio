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
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Dialog } from '@angular/cdk/dialog';
import { UsernameDialogComponent } from '../components/shared/username-dialog/username-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = user(this.auth);

  constructor(
    private auth: Auth, 
    private firestore: Firestore,
    private dialog: Dialog
  ) {}

  // Connexion avec Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const userDoc = await getDoc(doc(this.firestore, 'users', result.user.uid));
      console.log(userDoc)
      if (!userDoc.exists()) {
        const username = await this.showUsernameDialog();
        if (!username) {
          await this.logout();
          throw new Error('Username is required to complete registration');
        }
        await setDoc(doc(this.firestore, 'users', result.user.uid), {
          email: result.user.email,
          username: username,
          createdAt: new Date()
        });
      }
      
      return result;
    } catch (error) {
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
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Inscription
  async register(email: string, password: string, username: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      await setDoc(doc(this.firestore, 'users', result.user.uid), {
        email,
        username,
        createdAt: new Date()
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.auth.currentUser;
  }
}
