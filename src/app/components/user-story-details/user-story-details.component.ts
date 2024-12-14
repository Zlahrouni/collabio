import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserStory} from "../../models/userStory";

@Component({
  selector: 'clb-user-story-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-story-details.component.html',
  styleUrls: ['./user-story-details.component.scss']
})
export class UserStoryDetailsComponent {
  @Input() userStory: UserStory | null = null;

}
