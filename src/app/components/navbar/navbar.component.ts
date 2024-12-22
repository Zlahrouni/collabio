import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from 'src/app/services/auth.service';
import {Observable, Subscription} from 'rxjs';
import { User } from '@angular/fire/auth';
import {UserService} from "../../services/user.service";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {ThemeService} from "../../services/theme.service";

@Component({
  selector: 'clb-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TruncatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isConnected: boolean = false;
  protected username?: string = 'Unknown user';
  private documentClickListener: any;
  private authSubscription?: Subscription;
  private userDataSubscription?: Subscription;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {

    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );

    // Subscribe to auth state
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isConnected = !!user;
    });

    // Subscribe to user data changes
    this.userDataSubscription = this.authService.getCurrentUserData$().subscribe(userData => {
      if (userData) {
        this.username = userData.username;
      } else {
        this.username = 'Unknown user';
      }
    });

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

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
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
      this.userService.removeUserFromLocalStorage();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
