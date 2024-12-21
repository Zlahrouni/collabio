import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStory } from "../../models/userStory";
import { UserStoryService } from '../../services/user-story.service';
import { UserService } from '../../services/user.service';
import {TruncatePipe} from "../../pipes/truncate.pipe";
@Component({
  selector: 'clb-user-story-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './user-story-details.component.html',
  styleUrls: ['./user-story-details.component.scss']
})


export class UserStoryDetailsComponent {
  @Input() userStory: UserStory | null = null;
  @Output() userStoryUpdated = new EventEmitter<void>();

  isEditing = false;
  editForm: FormGroup;

  // Pour la gestion des utilisateurs
  allUsers: string[] = [];
  filteredUsers: string[] = [];
  showUserResults = false;
  userModified = false;
  errorMessages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userStoryService: UserStoryService,
    private userService: UserService
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['', Validators.required],
      type: ['', Validators.required],
      storyPoints: [0, [Validators.required, Validators.min(1), Validators.max(13)]]
    });
  }

  ngOnInit() {
    // Charger la liste des utilisateurs disponibles
    this.userService.getUsersUsernames().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  ngOnChanges() {
    if (this.userStory) {
      this.editForm.patchValue({
        title: this.userStory.title,
        description: this.userStory.description,
        status: this.userStory.status,
        type: this.userStory.type,
        storyPoints: this.userStory.storyPoints
      });
      this.userModified = false;
    }

    this.userService.getUsersUsernames().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.userStory) {
      this.editForm.patchValue(this.userStory);
      this.userModified = false;
    }
  }

  // Gestion des utilisateurs
  searchUsers(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(user => user.toLowerCase().includes(query))
      .slice(0, 4);
  }

  onUserSearchFocus() {
    this.showUserResults = true;
  }

  onUserSearchBlur() {
    setTimeout(() => {
      this.showUserResults = false;
    }, 200);
  }

  assignUser(username: string) {
    if (this.userStory) {
      this.userStory.assignedTo = username;
      this.userModified = true;
    }
  }

  removeAssignedUser() {
    if (this.userStory) {
      this.userStory.assignedTo = '';
      this.userModified = true;
    }
  }

  onSubmit() {
    this.errorMessages = [];
    if ((this.editForm.valid || this.userModified) && this.userStory?.id) {
      const updates = {
        ...this.editForm.value,
        assignedTo: this.userStory.assignedTo
      };

      this.userStoryService.updateUserStory(this.userStory.id, updates)
        .subscribe({
          next: () => {
            this.isEditing = false;
            this.userModified = false;
            this.userStoryUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating user story:', error);
            alert('Error updating user story');
          }
        });
    }else{
      Object.keys(this.editForm.controls).forEach(key => {
        const controlErrors = this.editForm.get(key)?.errors;
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


}
