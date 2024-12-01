import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'clb-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  private documentClickListener: any;

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.documentClickListener = (event: MouseEvent) => {
      const userMenuButton = document.getElementById('user-menu');
      const profileDropdown = document.getElementById('profile-dropdown');
      const projectsMenuButton = document.getElementById('projects-menu');
      const projectsDropdown = document.getElementById('projects-dropdown');

      // Ferme les menus si on clique en dehors
      if (!userMenuButton?.contains(event.target as Node) && !profileDropdown?.contains(event.target as Node)) {
        profileDropdown?.classList.add('hidden');
      }

      if (!projectsMenuButton?.contains(event.target as Node) && !projectsDropdown?.contains(event.target as Node)) {
        projectsDropdown?.classList.add('hidden');
      }
    };

    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentClickListener);
  }

  toggleMenu(menuId: string): void {
    const dropdown = document.getElementById(menuId);
    const otherMenuId = menuId === 'profile-dropdown' ? 'projects-dropdown' : 'profile-dropdown';
    const otherDropdown = document.getElementById(otherMenuId);

    if (dropdown?.classList.contains('hidden')) {
      dropdown.classList.remove('hidden');
      otherDropdown?.classList.add('hidden');
    } else {
      dropdown?.classList.add('hidden');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/=login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}