import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/models/project';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'clb-project',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  project: Project | null = null;
  isEditing = false;
  editForm: FormGroup;


  allUsers: string[] = [];
  filteredUsers: string[] = [];
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
      budget: [0, [Validators.required, Validators.min(0)]],
      users: [[]]
    });
   }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Extracted Route ID:', id);

      if (id) {
        this.projectService.getProjectById(id).subscribe({
          next: (project) => {
            console.log('Fetched Project Full Details:', project);

            if (project) {
              this.project = project;
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
        const currentUser = this.userService.getLocalUser()?.username;
        this.allUsers = users.filter(user => user !== currentUser);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
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


  searchUsers(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(user => 
        user.toLowerCase().includes(query) && 
        !this.project?.users.includes(user)
      )
      .slice(0, 4);
  }

  onUserSearchFocus() {
    this.showUserResults = true;
  }

  onUserSearchBlur() {
    // Ajout d'un petit delais avant de masquer les résultats
    setTimeout(() => {
      this.showUserResults = false;
    }, 200);
  }

  addUser(username: string) {
    if (this.project && !this.project.users.includes(username)) {
      const updatedUsers = [...this.project.users, username];
      this.updateProjectUsers(updatedUsers);
    }
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
