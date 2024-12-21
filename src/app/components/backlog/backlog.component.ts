import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStory } from 'src/app/models/userStory';
import { UserStoryService } from 'src/app/services/user-story.service';
import {ActivatedRoute} from "@angular/router";
import {ModalComponent} from "../shared/modal/modal.component";
import {CreateUserStoryComponent} from "../create-user-story/create-user-story.component";
import {UserStoryDetailsComponent} from "../user-story-details/user-story-details.component";
import {PriorityIconDirective} from "../../directives/priority-icon.directive";
import {TruncatePipe} from "../../pipes/truncate.pipe";

@Component({
  selector: 'clb-backlog',
  standalone: true,
  imports: [CommonModule, ModalComponent, CreateUserStoryComponent, UserStoryDetailsComponent, PriorityIconDirective, TruncatePipe],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss']
})
export class BacklogComponent implements OnInit {
  projectId: string = '';
  userStories: UserStory[] = [];
  userStoryModalOpen = false;
  deleteUserStoryModalOpen = false;
  selectedUserStory: UserStory | null = null;

  createUsModalOpen = false;


  @ViewChild(CreateUserStoryComponent) createUserStoryComponent!: CreateUserStoryComponent;

  constructor(private route: ActivatedRoute, private readonly userStorieService: UserStoryService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
    });

    // Fetch user stories for the project
    this.userStorieService.getUserStories(this.projectId!).subscribe({
      next: (userStories) => {
        this.userStories = userStories;
      },
      error: (error) => {
        console.error('Error fetching user stories:', error);
      }
    });
  }

  deleteUserStory(userStory: UserStory) {

    this.userStorieService.deleteUserStory(userStory.id!).subscribe({
      next: () => {
        this.userStories = this.userStories.filter(us => us.id !== userStory.id);
      },
      error: (error) => {
        console.error('Error deleting user story:', error);
        alert('Error deleting user story');
      }
    });

    this.closeDeleteUserStoryModal();

  }

  // Ajout d'une méthode pour rafraîchir la liste après une mise à jour
  refreshUserStories() {
    this.userStorieService.getUserStories(this.projectId).subscribe({
      next: (userStories) => {
        this.userStories = userStories;
      },
      error: (error) => {
        console.error('Error fetching user stories:', error);
      }
    });
  }

  openCreatedUSModal() {
    this.createUsModalOpen = true;
  }

  closeCreatedUSModal() {
    this.createUsModalOpen = false;

    if (this.createUserStoryComponent) {
      this.createUserStoryComponent.resetForm();
    }
  }

  openUserStoryModal(userStory: UserStory): void {
    this.selectedUserStory = userStory;
    this.userStoryModalOpen = true;
  }

  closeUserStoryModal(): void {
    this.userStoryModalOpen = false;
    this.selectedUserStory = null;
  }


  openDeleteUserStoryModal(userStory: UserStory, event: Event): void {
    event.stopPropagation();
    this.selectedUserStory = userStory;
    this.deleteUserStoryModalOpen = true;
  }

  closeDeleteUserStoryModal(): void {
    this.deleteUserStoryModalOpen = false;
    this.selectedUserStory = null;
  }


  onUserStoryUpdated(): void {
    this.refreshUserStories();
    this.closeUserStoryModal();
  }

}
