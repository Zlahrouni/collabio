import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  doc,
  setDoc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  deleteDoc,
  updateDoc
} from "@angular/fire/firestore";
import {Project} from "../models/project";
import {catchError, from, map, Observable, of, switchMap} from "rxjs";
import {UserService} from "./user.service";
import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projectCollection: CollectionReference<Project>;

  constructor(private readonly fireStore: Firestore, private readonly userService: UserService) {
    this.projectCollection = collection(this.fireStore, 'projects') as CollectionReference<Project>;
  }

  addProject(project: Project, users: string[]): Observable<Project> {
    users.push(this.userService.getLocalUser()!.username!);
    const projectId = uuidv4();
    // Use the existing project ID for the document
    const projectDocRef = doc(this.projectCollection, projectId);

    const projectToAdd: Project = {
      ...project,
      users,
      createdBy: this.userService.getLocalUser()!.username!
    };

    return from(setDoc(projectDocRef, projectToAdd)).pipe(
      map(() => ({
        ...projectToAdd,
      })),
      catchError(error => {
        console.error('Error adding project:', error);
        throw error;
      })
    );
  }

  getProjects() {
    return collectionData(this.projectCollection);
  }

  getMyProjects(): Observable<Project[]> {
    return collectionData(this.projectCollection, { idField: 'id' }).pipe(
      map(projects => {
        const user = this.userService.getLocalUser();

        if (!user) {
          console.error('No local user found');
          return [];
        }

        if (!user.username) {
          console.error('User exists but has no username');
          return [];
        }

        return projects.filter(project => project?.users?.includes(user!.username!));
      })
    );
  }

  getProjectById(id: string): Observable<Project | null> {
    const projectDocRef = doc(this.fireStore, 'projects', id);

    return from(getDoc(projectDocRef)).pipe(
      map(docSnapshot => {

        if (docSnapshot.exists()) {
          const projectData = docSnapshot.data() as Project;

          return {
            ...projectData,
            id: docSnapshot.id // Ensure the id is the document ID
          };
        }

        console.log('No project found with ID:', id);
        return null;
      }),
      catchError(error => {
        console.error('Error fetching project:', error);
        return of(null);
      })
    );
  }

  getUsernamesOfProject(projectId: string): Observable<string[]> {
    const projectDocRef = doc(this.projectCollection, projectId);

    return from(getDoc(projectDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const projectData = docSnapshot.data() as Project;
          return projectData.users;
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching project:', error);
        return of([]);
      })
    );
  }

  updateProject(projectId: string, updates: Partial<Project>): Observable<void> {
    const projectRef = doc(this.projectCollection, projectId);

    return from(getDoc(projectRef)).pipe(
      switchMap(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Project not found');
        }

        const currentUser = this.userService.getLocalUser();
        if (!currentUser?.username) {
          throw new Error('User not authenticated');
        }

        const project = docSnapshot.data();
        if (project.createdBy !== currentUser.username) {
          throw new Error('Unauthorized: Only the project creator can update the project');
        }

        // Mise à jour du document
        return from(updateDoc(projectRef, updates));
      }),
      catchError(error => {
        console.error('Error updating project:', error);
        throw error;
      })
    );
  }


  deleteProject(projectId: string): Observable<void> {
    return this.getProjectById(projectId).pipe(
      switchMap(project => {
        if (!project) {
          throw new Error('Project not found');
        }

        const currentUser = this.userService.getLocalUser();
        if (!currentUser?.username) {
          throw new Error('User not authenticated');
        }

        // Vérifier si l'utilisateur est le créateur du projet
        if (project.createdBy !== currentUser.username) {
          throw new Error('Unauthorized: Only the project creator can delete the project');
        }

        const projectDocRef = doc(this.projectCollection, projectId);
        return from(deleteDoc(projectDocRef));
      }),
      catchError(error => {
        console.error('Error deleting project:', error);
        throw error;
      })
    );
  }


  
}
