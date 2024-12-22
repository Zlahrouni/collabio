import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStory } from "../../models/userStory";
import { UserStoryService } from '../../services/user-story.service';
import { UserService } from '../../services/user.service';
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {AuthService} from "../../services/auth.service";
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
  currentUser: string = '';
  isProjectCreator: boolean = false;

  allUsers: string[] = [];
  filteredUsers: string[] = [];
  isFocused = false;
  userModified = false;
  errorMessages: string[] = [];

  types = ['Functionality', 'Update', 'Bug fix'];
  priorities = ['High', 'Medium', 'Low'];
  allstatus = ['Not started', 'In progress', 'Completed'];

  constructor(
    private fb: FormBuilder,
    private userStoryService: UserStoryService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.editForm = this.createForm();
    this.initializeCurrentUser();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Not started', Validators.required],
      priority: ['Medium', Validators.required],
      type: ['', Validators.required],
      storyPoints: [0, [Validators.required, Validators.min(1), Validators.max(13)]]
    });
  }

  private async initializeCurrentUser() {
    this.currentUser = await this.userService.getLocalUser()?.username!;
    this.isProjectCreator = await this.userStoryService.isProjectOwner(this.currentUser);
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngOnChanges() {
    if (this.userStory) {
      this.editForm.patchValue(this.userStory);
      this.userModified = false;
    }
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getUsersUsernames().subscribe({
      next: (users) => this.allUsers = users,
      error: (error) => console.error('Error loading users:', error)
    });
  }

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

  canShowEditButton(): boolean {
    if (!this.userStory) return false;

    // Cannot edit completed stories
    if (this.userStory.status === 'Completed') return false;

    // Project creator can always edit
    if (this.isProjectCreator) return true;

    // If story is not assigned, any member can edit
    if (!this.userStory.assignedTo) return true;

    // Assigned user can edit their own stories
    return this.userStory.assignedTo === this.currentUser;
  }

  canChangeStatus(): boolean {
    if (!this.userStory) return false;
    return this.userStory.assignedTo === this.currentUser || this.isProjectCreator;
  }

  validateStatusTransition(newStatus: string): boolean {
    if (!this.userStory) return false;

    const statusOrder = ['Not started', 'In progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(this.userStory.status);
    const newIndex = statusOrder.indexOf(newStatus);

    // Cannot move backwards
    if (newIndex < currentIndex) return false;

    // Cannot skip status
    if (newIndex > currentIndex + 1) return false;

    return true;
  }

  onStatusChange(event: any) {
    const newStatus = event.target.value;
    if (!this.validateStatusTransition(newStatus)) {
      event.preventDefault();
      this.editForm.patchValue({ status: this.userStory?.status });
      this.errorMessages.push('Invalid status transition');
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.userStory) {
      this.editForm.patchValue(this.userStory);
      this.userModified = false;
      this.errorMessages = [];
    }
  }

  onSubmit() {
    this.errorMessages = [];

    if (!this.editForm.valid && !this.userModified) {
      this.validateForm();
      return;
    }

    if (this.userStory?.id) {
      const updates = {
        ...this.editForm.value,
        assignedTo: this.userStory.assignedTo
      };

      // Validate status change
      if (updates.status !== this.userStory.status && !this.canChangeStatus()) {
        this.errorMessages.push('You are not authorized to change the status');
        return;
      }

      // Prevent unassigning from in-progress story
      if (this.userStory.status === 'In progress' && !updates.assignedTo) {
        this.errorMessages.push('Cannot unassign from an in-progress story');
        return;
      }

      this.userStoryService.updateUserStory(this.userStory.id, updates)
        .subscribe({
          next: () => {
            this.isEditing = false;
            this.userModified = false;
            this.userStoryUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating user story:', error);
            this.errorMessages.push('Error updating user story');
          }
        });
    }
  }

  private validateForm() {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control?.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          this.errorMessages.push(this.getErrorMessage(key, errorKey));
        });
      }
    });

    if (this.errorMessages.length > 0) {
      setTimeout(() => {
        const errorElement = document.getElementById('error-messages');
        errorElement?.focus();
      });
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
