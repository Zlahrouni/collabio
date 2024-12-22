import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";
import {Project} from "../../models/project";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import { ModalComponent } from '../shared/modal/modal.component';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'clb-project-preview',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterLink, TruncatePipe],
  templateUrl: './project-preview.component.html',
  styleUrls: ['./project-preview.component.scss']
})



export class ProjectPreviewComponent {
  
  constructor(
    private userService: UserService,
  ) {}
  @Input() project!: Project;
  @Output() deleteProject = new EventEmitter<string>();
  showConfirmDelete = false;
  CanDelete = false;

  ngOnInit() {
    //  Verifier si l'utilisateur est le création du projet
    const currentUser = this.userService.getLocalUser()?.username;
    if(currentUser === this.project.createdBy) {
      this.CanDelete = true
    }
  }



  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.showConfirmDelete = true;
  }

  confirmDelete(): void {
    if (this.project.id) {
      this.deleteProject.emit(this.project.id);
    }
    this.showConfirmDelete = false;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
  }
}
