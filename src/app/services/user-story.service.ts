import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  addDoc,
  docData,
  DocumentReference,
  collectionData,
  query, where, doc, setDoc,
  deleteDoc,
  updateDoc,
  getDocs
} from '@angular/fire/firestore';
import { UserStory } from '../models/userStory';
import {catchError, from, map, Observable, switchMap} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UserStoryService {
  static readonly NOTSTARTED = 'Not started';
  static readonly INPROGRESS = 'In progress';
  static readonly COMPLETED = 'Completed';
  private readonly userStoriesCollection: CollectionReference<UserStory>;
  constructor(private readonly firestore: Firestore) {
    this.userStoriesCollection = collection(this.firestore, 'userStories') as CollectionReference<UserStory>;
  }
  createUserStory(projectId: string, title: string, description: string, type: string, storyPoints: number, assignedTo: string): Observable<UserStory> {
    const userStoryId = uuidv4();
    const userStoryDocRef = doc(this.userStoriesCollection, userStoryId);
    const userStory: UserStory = {
      type,
      storyPoints,
      assignedTo,
      description,
      title,
      projectId,
      status: UserStoryService.NOTSTARTED,
      createdAt: new Date().toISOString()
    };

    return from(setDoc(userStoryDocRef, userStory)).pipe(
      map(() => ({
        ...userStory,
      })),
      catchError(error => {
        console.error('Error adding project:', error);
        throw error;
      })
    );
  }
  getUserStories(projectId: string): Observable<UserStory[]> {
    const userStoriesCollection = collection(this.firestore, 'userStories');
    const q = query(userStoriesCollection, where("projectId", "==", projectId));

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        return querySnapshot.docs.map(doc => ({
          id: doc.id,  // S'assurer que ceci est présent
          ...doc.data()
        } as UserStory));
      })
    );
  }


  updateUserStory(userStoryId: string, updates: Partial<UserStory>): Observable<void> {
    const userStoryRef = doc(this.firestore, 'userStories', userStoryId);
    return from(updateDoc(userStoryRef, updates));
  }

  deleteUserStory(userStoryId: string): Observable<void> {
    const userStoryRef = doc(this.firestore, 'userStories', userStoryId);
    return from(deleteDoc(userStoryRef));
  }


}
