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
  selectedUsers: string = '';
  isFocused = false;
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
      status: ['Not started', Validators.required],
      priority: ['Medium', Validators.required],
      type: ['', Validators.required],
      storyPoints: [0, [Validators.required, Validators.min(1), Validators.max(13)]]
    });
  }

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

  allstatus = [
    'Completed',
    'In progress',
    'Not started'
  ];

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


  CanUpdate(): boolean {
    // Vérifie si userStory existe
    if (!this.userStory) {  
      return false;
    }

    // Si l'histoire est complétée, on ne peut pas la modifier
    if (this.userStory.status === 'Completed') {
      return false;
    }

    // Vérifie si le statut est en cours et qu'on essaie de désaffecter
    if (this.userStory.status === 'In progress' && 
        this.userStory.assignedTo && 
        !this.editForm.get('assignedTo')?.value) {
      return false;
    }

    // Vérifie la progression du statut
    const statusOrder = ['Not started', 'In progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(this.userStory.status);
    const newStatus = this.editForm.get('status')?.value;

    if (!newStatus) {
      return true; // Si pas de changement de statut, on autorise
    }

    const newIndex = statusOrder.indexOf(newStatus);

    // Empêche de rétrograder le statut
    if (newIndex < currentIndex) {
      return false;
    }

    // Empêche de sauter un statut
    if (newIndex > currentIndex + 1) {
      return false;
    }

    // Par défaut, on autorise la modification
    return true;
  }

  // Gestion des utilisateurs
  searchUsers(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    if (query === '') {
      this.filteredUsers = [...this.allUsers].slice(0, 4);
    } else {
      this.filteredUsers = this.allUsers
        .filter(user => user.toLowerCase().includes(query))
        .slice(0, 4);
    }
  }

  onFocus(): void {
    this.isFocused = true;
    if (this.filteredUsers.length === 0) {
      this.filteredUsers = [...this.allUsers].slice(0, 4);
    }
  }

  onBlur(): void {
    this.isFocused = false;
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
      this.isFocused = false;
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


}
