import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStory } from 'src/app/models/userStory';
import { UserStoryService } from 'src/app/services/user-story.service';

@Component({
  selector: 'clb-user-story',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss']
})
export class BacklogComponent implements OnInit {
  userStories: UserStory[] =[];
  constructor(private readonly userStoryService: UserStoryService) {}

  ngOnInit() {
    this.userStoryService.getUserStories().subscribe(
      {
        next: (userStories: UserStory[]) => {
          this.userStories = userStories;
        },
        error: (error) => {
          console.error('Error getting user stories:', error);
        }
      }
    )
  }
}
