import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from 'src/app/services/auth.service';
import {debounceTime, distinctUntilChanged, Observable, Subscription} from 'rxjs';
import { User } from '@angular/fire/auth';
import {UserService} from "../../services/user.service";
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {ThemeService} from "../../services/theme.service";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {ProjectService} from "../../services/project.service";

@Component({
  selector: 'clb-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TruncatePipe, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isConnected: boolean = false;
  protected username?: string = 'Unknown user';
  private documentClickListener: any;
  private authSubscription?: Subscription;
  private userDataSubscription?: Subscription;
  private searchSubscription?: Subscription;
  isDarkMode: boolean = false;

  searchControl = new FormControl('');
  showSearchResults = false;
  searchResults: any[] = [];
  isSearching = false;

  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
    private router: Router,
    private themeService: ThemeService,
    private projectService: ProjectService
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

    // Setup search subscription with debounce
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.length >= 2) {
        this.performSearch(searchTerm);
      } else {
        this.searchResults = [];
        this.showSearchResults = false;
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

  private async performSearch(searchTerm: string) {
    this.isSearching = true;
    try {
      this.searchResults = await this.projectService.searchProjects(searchTerm);
      this.showSearchResults = true;
    } catch (error) {
      console.error('Error searching projects:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  navigateToProject(projectId: string) {
    this.showSearchResults = false;
    this.searchControl.setValue('');
    this.router.navigate(['/project', projectId]);
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
