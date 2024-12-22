import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'clb-not-authorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.scss']
})
export class NotAuthorizedComponent {
  goBack(): void {
    window.history.back();
  }
}
