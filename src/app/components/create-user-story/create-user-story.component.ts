import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {
  AbstractControl, AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {NgForOf, NgIf} from "@angular/common";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";
import {ProjectService} from "../../services/project.service";
import {UserStoryService} from "../../services/user-story.service";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {catchError, map, Observable, of} from "rxjs";

@Component({
  selector: 'clb-create-user-story',
  templateUrl: './create-user-story.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    TruncatePipe
  ],
  styleUrls: ['./create-user-story.component.scss']
})
export class CreateUserStoryComponent implements OnInit {
  userStoryForm?: FormGroup;
  filteredUsers: string[] = [];
  selectedUsers: string = '';
  isFocused = false;
  errorMessages: string[] = [];
  @Input() projectId: string = '';
  @Output() userStoryCreated: EventEmitter<void> = new EventEmitter<void>();

  types = [
    'Functionality',
    'Update',
    'Bug fix',
  ];

  priorities = [
    'High',
    'Medium',
    'Low'
  ];

  constructor(
    private fb: FormBuilder,
    private readonly projectService: ProjectService,
    private readonly userStoryService: UserStoryService
    ) {

  }

  ngOnInit(): void {
    this.initForm();
    this.projectService.getUsernamesOfProject(this.projectId).subscribe(users => {
      console.log('Users:', users)
      this.filteredUsers = users;
    });
  }

  initForm(): void {
    const defaultValues = {
      title: '',
      description: '',
      type: 'Functionality',
      priority: 'Medium',
      storyPoints: 3
    };

    this.userStoryForm = this.fb.group({
      title: [defaultValues.title, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: [defaultValues.description, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      type: [defaultValues.type, Validators.required],
      priority: [defaultValues.priority, Validators.required],
      storyPoints: [defaultValues.storyPoints, [
        Validators.required,
        Validators.min(1),
        Validators.max(13)
      ]],
    });
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
  }

  searchUsers(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.filteredUsers.filter(user => user.toLowerCase().includes(query));
  }

  addUser(user: string): void {
    this.selectedUsers = user;
  }

  removeUser(user: string): void {
    if (this.selectedUsers === user) {
      this.selectedUsers = '';
      this.isFocused = false;
    }
  }

  onSubmit(): void {
    this.errorMessages = [];
    if (this.userStoryForm?.valid) {
      const title = this.userStoryForm.get('title')?.value;
      const description = this.userStoryForm.get('description')?.value;
      const priority = this.userStoryForm.get('priority')?.value;
      const type = this.userStoryForm.get('type')?.value;
      const storyPoints = this.userStoryForm.get('storyPoints')?.value;
      const assignedTo = this.selectedUsers;
      this.userStoryService.createUserStory(this.projectId, title, description, type, priority, storyPoints, assignedTo).subscribe({
        next: (userStory) => {
          this.userStoryCreated.emit()
          this.userStoryForm?.reset();
          this.selectedUsers = '';
        },
        error: (error) => {
          console.error('Error adding user story:', error);
        }
      });
    } else {
      Object.keys(this.userStoryForm?.controls!).forEach(key => {
        const controlErrors = this.userStoryForm?.get(key)?.errors;
        if (controlErrors) {
          Object.keys(controlErrors).forEach(errorKey => {
            this.errorMessages.push(this.getErrorMessage(key, errorKey));
          });
        }
      });

      // Focus with a timeout to ensure the element is rendered
      if (this.errorMessages.length > 0) {
        setTimeout(() => {
          const errorMessagesElement = document.getElementById('error-messages');
          if (errorMessagesElement) {
            errorMessagesElement.focus();
          }
        }, 0);
      }
    }
  }

  getErrorMessage(controlName: string, errorKey: string): string {
    const errorMessages: { [key: string]: { [key: string]: string } } = {
      title: {
        required: 'Title is required',
        minlength: 'Title must be at least 3 characters long',
        maxlength: 'Title cannot be more than 100 characters long',
        uniqueTitle: 'Title must be unique within the project'
      },
      description: {
        required: 'Description is required',
        minlength: 'Description must be at least 10 characters long',
        maxlength: 'Description cannot be more than 500 characters long'
      },
      priority: {
        required: 'Priority is required'
      },
      type: {
        required: 'Type is required'
      },
      status: {
        required: 'Status is required'
      },
      storyPoints: {
        required: 'Story points are required',
        min: 'Story points must be at least 1',
        max: 'Story points cannot be more than 13'
      }
    };
    return errorMessages[controlName][errorKey];
  }

  resetForm(): void {
    this.selectedUsers = '';
    this.errorMessages = [];
    this.ngOnInit();
  }
}
