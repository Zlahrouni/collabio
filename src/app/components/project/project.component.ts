import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/models/project';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { BudgetValidators } from 'src/app/components/shared/validators/budget.validators';
@Component({
  selector: 'clb-project',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  isProjectMember: boolean = false;
  project: Project | null = null;
  isEditing = false;
  editForm: FormGroup;
  isFocused = false;
  errors: string[] = [];
  currentUser?: string;

  users: string[] = [];
  filteredUsers: string[] = [];
  selectedUsers: string[] = [];
  showUserResults = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      budget: [0, Validators.required],
      users: [[]]
    });
   }

  ngOnInit() {
    // Get current user first
    this.currentUser = this.userService.getLocalUser()?.username;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Extracted Route ID:', id);

      if (id) {
        this.projectService.getProjectById(id).subscribe({
          next: (project) => {
            if (project) {
              this.project = project;
              this.checkProjectMembership();
            } else {
              console.warn('No project found with the given ID');
            }
          },
          error: (error) => {
            console.error('Detailed Error fetching project:', error);
          },
          complete: () => {
            console.log('Project fetch observable completed');
          }
        });
      } else {
        console.error('No project ID found in route');
      }
    });

    this.userService.getUsersUsernames().subscribe({
      next: (users) => {

        this.users = users.filter(user => user !== this.currentUser);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  private checkProjectMembership() {
    if (this.project && this.currentUser) {
      this.isProjectMember = this.project.users.includes(this.currentUser);
    } else {
      this.isProjectMember = false;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.project) {
      this.editForm.patchValue({
        name: this.project.name,
        description: this.project.description,
        budget: this.project.budget,
        users: this.project.users
      });
      const budgetControl = this.editForm.get('budget');
      if (budgetControl) {
        budgetControl.setValidators([
          Validators.required,
          BudgetValidators.minCurrentBudget(this.project.budget)
        ]);
        budgetControl.updateValueAndValidity();
      }
    }
  }

  onSubmit() {
    if (this.editForm.valid && this.project?.id) {
      const updates = {
        name: this.editForm.get('name')?.value,
        description: this.editForm.get('description')?.value,
        budget: this.editForm.get('budget')?.value,
        users: this.project.users
      };

      this.projectService.updateProject(this.project.id, updates).subscribe({
        next: () => {
          if (this.project) {
            // Update le project locale
            this.project = {
              ...this.project,
              ...updates
            };
          }
          this.isEditing = false;
        },
        error: (error) => {
          console.error('Error updating project:', error);
          if (error.message.includes('Unauthorized')) {
            alert('You can only update projects you created');
          } else {
            alert('An error occurred while updating the project');
          }
        }
      });
    }
  }


  searchUsers(eventOrQuery: Event | string = '') {
    let query: string;
    if (typeof eventOrQuery === 'string') {
      query = eventOrQuery;
    } else {
      query = (eventOrQuery.target as HTMLInputElement).value;
    }

    if (query || this.isFocused) {
      this.filteredUsers = this.users
        .filter(user =>
          user.toLowerCase().includes(query.toLowerCase()) &&
          !this.selectedUsers.some(selected => selected === user)
        )
        .slice(0, 4); // Limit to the first four users
    } else {
      this.filteredUsers = [];
    }
  }

  addUser(user: string) {
    if (this.project && !this.project.users.includes(user)) {
      const updatedUsers = [...this.project.users, user];
      this.selectedUsers.push(user);
      this.updateProjectUsers(updatedUsers);
      this.filteredUsers = [];
      this.isFocused = false;
    }
  }

  onFocus() {
    this.isFocused = true;
    this.searchUsers('');
  }

  onBlur() {
    this.isFocused = false;
    this.filteredUsers = [];
  }

  removeUser(username: string) {
    if (this.project) {
    // Sans la suppresion du host du projet
      if (username === this.project.createdBy) {
        return;
      }

      const updatedUsers = this.project.users.filter(user => user !== username);
      this.updateProjectUsers(updatedUsers);
    }
  }

  get budgetControl() {
    return this.editForm.get('budget');
  }

  private updateProjectUsers(users: string[]) {
    if (this.project?.id) {
      this.projectService.updateProject(this.project.id, { users }).subscribe({
        next: () => {
          if (this.project) {
            this.project.users = users;
            this.editForm.markAsDirty();
          }
        },
        error: (error) => {
          console.error('Error updating project users:', error);
          alert('Error updating project users');
        }
      });
    }
  }




}
