import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";
import {Project} from "../../models/project";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import { ModalComponent } from '../shared/modal/modal.component';

@Component({
  selector: 'clb-project-preview',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterLink, TruncatePipe],
  templateUrl: './project-preview.component.html',
  styleUrls: ['./project-preview.component.scss']
})
export class ProjectPreviewComponent {
  @Input() project!: Project;
  @Output() deleteProject = new EventEmitter<string>();
  
  showConfirmDelete = false;

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
