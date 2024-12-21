import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStory } from 'src/app/models/userStory';
import { UserStoryService } from 'src/app/services/user-story.service';
import {ActivatedRoute} from "@angular/router";
import {ModalComponent} from "../shared/modal/modal.component";
import {CreateUserStoryComponent} from "../create-user-story/create-user-story.component";
import {UserStoryDetailsComponent} from "../user-story-details/user-story-details.component";
import {PriorityIconDirective} from "../../directives/priority-icon.directive";

@Component({
  selector: 'clb-backlog',
  standalone: true,
  imports: [CommonModule, ModalComponent, CreateUserStoryComponent, UserStoryDetailsComponent, PriorityIconDirective],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss']
})
export class BacklogComponent implements OnInit {
  projectId: string = '';
  userStories: UserStory[] = [];
  userStoryModalOpen = false;
  selectedUserStory: UserStory | null = null;

  createUsModalOpen = false;


  @ViewChild(CreateUserStoryComponent) createUserStoryComponent!: CreateUserStoryComponent;

  constructor(private route: ActivatedRoute, private readonly userStorieService: UserStoryService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      console.log('Route Params:', params.get('id'))
      this.projectId = params.get('id')!;
      console.log('Backlog for Project ID:', this.projectId);
    });

    // Fetch user stories for the project
    this.userStorieService.getUserStories(this.projectId!).subscribe({
      next: (userStories) => {
        this.userStories = userStories;
      },
      error: (error) => {
        console.error('Error fetching user stories:', error);
      },
      complete: () => {
        console.log('User stories fetch observable completed');
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

  deleteUserStory(userStory: UserStory) {

  }
}
