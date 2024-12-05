import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, addDoc, docData, DocumentReference } from '@angular/fire/firestore';
import { UserStory } from '../models/userStory';
import { from, map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoryService {
  private readonly userStoriesCollection: CollectionReference<UserStory>;
  constructor(private readonly firestore: Firestore) {
    this.userStoriesCollection = collection(this.firestore, 'userStories') as CollectionReference<UserStory>;
  }
  createUserStory(userStory: UserStory): Observable<UserStory> {
    const userStoryToadd = { ...userStory, createdAt: new Date().toISOString() };
    return from(addDoc(this.userStoriesCollection, userStoryToadd)).pipe(
      switchMap(docRef => docData(docRef as DocumentReference<UserStory>).pipe(
        map(userStory => ({ id: docRef.id, ...userStory } as UserStory))
      ))
    );
  }
}
