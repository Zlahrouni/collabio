import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  docData,
  DocumentReference,
  Firestore
} from "@angular/fire/firestore";
import {Project} from "../models/project";
import {from, map, switchMap} from "rxjs";
import {AuthService} from "./auth.service";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projectCollection: CollectionReference<Project>;

  constructor(private readonly fireStore: Firestore, private readonly userService: UserService) {
    this.projectCollection = collection(this.fireStore, 'projects') as CollectionReference<Project>;
  }

  addProject(name: string, description: string, budget: number, users: string[]) {
    users.push(this.userService.getLocalUser()!.username!);
    const project: Project = {
      name,
      description,
      budget,
      status: 'Started',
      createdBy: this.userService.getLocalUser()!.username,
      Date: new Date(),
      tasks: [],
      users
    };
    return from(addDoc(this.projectCollection, project)).pipe(
      switchMap(docRef => docData(docRef as DocumentReference<Project>).pipe(
        map(project => ({ id: docRef.id, ...project } as Project))
      ))
    );
  }

  getProjects() {
    return collectionData(this.projectCollection);
  }

  getMyProjects() {
    return collectionData(this.projectCollection).pipe(
      map(projects => {
        const user = this.userService.getLocalUser();
        return projects.filter(project => project?.users?.includes(user!.username!));
      })
    );
  }
}
