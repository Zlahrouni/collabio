import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'clb-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user$ = false;
  ngOnInit(): void {
    const userMenuButton = document.getElementById('user-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    const projectsMenuButton = document.getElementById('projects-menu');
    const projectsDropdown = document.getElementById('projects-dropdown');

    projectsMenuButton?.addEventListener('click', () => {
      if (projectsDropdown?.classList.contains('hidden')) {
        projectsDropdown.classList.remove('hidden');
        profileDropdown?.classList.add('hidden');
      } else {
        projectsDropdown?.classList.add('hidden');
      }
    });

    userMenuButton?.addEventListener('click', () => {
      if (profileDropdown?.classList.contains('hidden')) {
        profileDropdown.classList.remove('hidden');
        projectsDropdown?.classList.add('hidden');
      } else {
        profileDropdown?.classList.add('hidden');
      }
    });
  }
}
