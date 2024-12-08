import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference, doc,
  docData,
  DocumentReference,
  Firestore, setDoc
} from "@angular/fire/firestore";

import {from, map, Observable, switchMap, tap} from "rxjs";
import {User} from "../models/user";
import {Project} from "../models/project";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private localUser$?: User;
  private readonly userCollection: CollectionReference<User>;
  constructor(private readonly fireStore: Firestore) {
    this.userCollection = collection(this.fireStore, 'users') as CollectionReference<User>;
  }

  // Add user to the database
  addUser(docId: string, username: string, email: string): Observable<User> {
    const user: User = {
      username,
      email,
      createdAt: new Date()
    };
    const userDocRef = doc(this.userCollection, docId);
    return from(setDoc(userDocRef, user)).pipe(
      switchMap(() => docData(userDocRef).pipe(
        map(userData => ({id: docId, ...userData} as User)),
        tap(user => this.saveUserToLocalStorage(user))
      ))
    );
  }

  getUsersUsernames(): Observable<any[]> {
    return collectionData(this.userCollection).pipe(
      map(users => users.map(user => user.username))
    );
  }

  getUserByUsername(username: string): Observable<User | undefined> {
    return collectionData(this.userCollection).pipe(
      map(users => users.find(user => user.username === username))
    );
  }

  getUserByIdDoc(docId: string): Observable<User | undefined> {
    const userDocRef = doc(this.userCollection, docId);
    return docData(userDocRef);
  }

  saveUserToLocalStorage(user: User) {
    console.log('Saving user to localStorage:', user)
    localStorage.setItem('user', JSON.stringify(user));
    this.localUser$ = user;
  }

  // Remove user info from localStorage
  removeUserFromLocalStorage() {
    localStorage.removeItem('user');
    this.localUser$ = undefined;
  }

  getLocalUser(): User | undefined {
    if (!this.localUser$) {
      const user = localStorage.getItem('user');
      if (user) {
        this.localUser$ = JSON.parse(user);
      }
    }
    return this.localUser$;
  }
}
