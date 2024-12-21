import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStory } from 'src/app/models/userStory';
import { UserStoryService } from 'src/app/services/user-story.service';
import {ActivatedRoute} from "@angular/router";
import {ModalComponent} from "../shared/modal/modal.component";
import {CreateUserStoryComponent} from "../create-user-story/create-user-story.component";
import {UserStoryDetailsComponent} from "../user-story-details/user-story-details.component";
import {PriorityIconDirective} from "../../directives/priority-icon.directive";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'clb-backlog',
  standalone: true,
  imports: [CommonModule, ModalComponent, CreateUserStoryComponent, UserStoryDetailsComponent, PriorityIconDirective, TruncatePipe, FormsModule],
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
  searchTerm: string = '';
  filteredUserStories: UserStory[] = [];
  private searchSubject = new Subject<string>();
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(CreateUserStoryComponent) createUserStoryComponent!: CreateUserStoryComponent;
  private readonly priorityOrder = {
    'High': 1,
    'Medium': 2,
    'Low': 3
  };

  constructor(private route: ActivatedRoute, private readonly userStorieService: UserStoryService) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterUserStories(searchTerm);
    });

    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
    });

    // Fetch and sort user stories
    this.userStorieService.getUserStories(this.projectId!).subscribe({
      next: (userStories) => {
        this.userStories = this.sortUserStoriesByPriority(userStories);
        this.filteredUserStories = this.userStories;
      },
      error: (error) => {
        console.error('Error fetching user stories:', error);
      }
    });
  }

  private sortUserStoriesByPriority(stories: UserStory[]): UserStory[] {
    return [...stories].sort((a, b) => {
      const priorityA = this.priorityOrder[a.priority as keyof typeof this.priorityOrder] || 999;
      const priorityB = this.priorityOrder[b.priority as keyof typeof this.priorityOrder] || 999;
      return priorityA - priorityB;
    });
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm.toLowerCase());
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.searchInput.nativeElement.focus();
  }

  private filterUserStories(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUserStories = [...this.userStories]; // Already sorted
      return;
    }

    this.filteredUserStories = this.userStories.filter(story => {
      const searchTermLower = searchTerm.toLowerCase();

      const titleMatch = story.title?.toLowerCase()?.includes(searchTermLower) ?? false;
      const descriptionMatch = story.description?.toLowerCase()?.includes(searchTermLower) ?? false;
      const typeMatch = story.type?.toLowerCase()?.includes(searchTermLower) ?? false;
      const priorityMatch = story.priority?.toLowerCase()?.includes(searchTermLower) ?? false;
      const assignedToMatch = story.assignedTo?.toLowerCase()?.includes(searchTermLower) ?? false;
      const statusMatch = story.status?.toLowerCase()?.includes(searchTermLower) ?? false;

      return titleMatch ||
        descriptionMatch ||
        typeMatch ||
        priorityMatch ||
        assignedToMatch ||
        statusMatch;
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
        this.userStories = this.sortUserStoriesByPriority(userStories);
        if (this.searchTerm) {
          this.filterUserStories(this.searchTerm);
        } else {
          this.filteredUserStories = [...this.userStories];
        }
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
