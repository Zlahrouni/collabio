import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModalComponent} from "../shared/modal/modal.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Project} from "../../models/project";
import {UserService} from "../../services/user.service";
import {ProjectService} from "../../services/project.service";

@Component({
  selector: 'clb-home',
  standalone: true,
  imports: [CommonModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  projectForm: FormGroup;
  createProjectModalOpen = false;
  isFocused = false;
  errors: string[] = [];

  users: string[] = [];
  filteredUsers: string[] = [];
  selectedUsers: string[] = [];

  projects: Project[] = [];

  constructor(private fb: FormBuilder, private readonly userService: UserService, private readonly projectService: ProjectService) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['Started'],
      budget: [0],
      users: [[]]
    });
  }

  ngOnInit() {
    const currentUser = this.userService.getLocalUser()?.username;

    this.userService.getUsersUsernames().subscribe(
      {
        next: (users: string[]) => {
          this.users = users.filter(user => user !== currentUser);
        },
        error: (error) => {
          console.error('Error getting users:', error);
        }
      }
    );

    this.projectService.getMyProjects().subscribe(
      {
        next: (projects: Project[]) => {
          this.projects = projects;
        },
        error: (error) => {
          console.error('Error getting projects:', error);
        }
      }
    );
  }

  openModal() {
    this.createProjectModalOpen = true;
  }

  closeModal() {
    this.createProjectModalOpen = false;
  }

  searchUsers(eventOrQuery: Event | string = '') {
    let query: string;
    if (typeof eventOrQuery === 'string') {
      query = eventOrQuery;
    } else {
      query = (eventOrQuery.target as HTMLInputElement).value;
    }

    if (query || this.isFocused) {
      this.filteredUsers = this.users.filter(user =>
        user.toLowerCase().includes(query.toLowerCase()) &&
        !this.selectedUsers.some(selected => selected === user)
      );
    } else {
      this.filteredUsers = [];
    }
  }

  addUser(user: string) {
    if (!this.selectedUsers.some(u => u === user)) {
      this.selectedUsers.push(user);
      this.projectForm.get('users')?.setValue(this.selectedUsers);
      this.filteredUsers = [];
      this.isFocused = false;
    }
  }

  removeUser(user: string) {
    this.selectedUsers = this.selectedUsers.filter(u => u !== user);
    this.projectForm.get('users')?.setValue(this.selectedUsers);
  }

  onFocus() {
    this.isFocused = true;
    this.searchUsers('');
  }

  onBlur() {
    this.isFocused = false;
    this.filteredUsers = [];
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const name = this.projectForm.get('name')?.value;
      const description = this.projectForm.get('description')?.value;
      const users = this.projectForm.get('users')?.value;
      const budget = this.projectForm.get('budget')?.value;
      this.projectService.addProject(name, description, budget, users).subscribe(
        {
          next: (project: Project) => {
            console.log('Project Created:', project);
          },
          error: (error) => {
            console.error('Error creating project:', error);
          }
        }
      );
      this.closeModal();
    } else {
      this.errors = [];
      for (const control in this.projectForm.controls) {
        if (this.projectForm.controls[control].errors) {
          for (const error in this.projectForm.controls[control].errors) {
            switch (error) {
              case 'required':
                this.errors.push(`${control} is required`);
                break;
              default:
                this.errors.push('Invalid input');
                break;
            }
          }
        }
      }

      console.log('Errors : ', this.errors);
    }
  }
}
