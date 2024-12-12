import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'clb-project',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  project: Project | null = null;

  constructor(
    private route: ActivatedRoute, 
    private projectService: ProjectService
  ) { }

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
              console.log('Project set successfully:', this.project);
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
  }
}