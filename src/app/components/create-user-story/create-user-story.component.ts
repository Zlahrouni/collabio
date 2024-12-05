import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserStory } from 'src/app/models/userStory';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoryService } from 'src/app/services/user-story.service';

@Component({
  selector: 'app-create-user-story',
  templateUrl: './create-user-story.component.html',
  styleUrls: ['./create-user-story.component.scss']
})
export class CreateUserStoryComponent implements OnInit {
  userStoryForm!: FormGroup;
  //users$: Observable<User[]>;
  
  // Listes statiques basées sur le modèle UserStory
  types = [
    'Fonctionnalité', 
    'Amélioration', 
    'Correction de bug'
  ];

  status = [
    'Not started', 
    'Pending', 
    'Finish'
  ];

  storyPoints = [1, 2, 3, 5, 8, 13];

  // Gestion des états de formulaire
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private userStoryService: UserStoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialiser le formulaire
    this.initForm();

    // Récupérer les utilisateurs de Firebase
    //this.users$ = this.authService.getCurrentUser(); // Assuming getUsers() returns Observable<User[]>
  }

  initForm(): void {
    this.userStoryForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      type: ['Fonctionnalité', Validators.required],
      status: ['Not started', Validators.required],
      storyPoints: [3, [
        Validators.required,
        Validators.min(1),
        Validators.max(13)
      ]],
    });
  }

  // Méthode de validation personnalisée
  isFieldInvalid(fieldValue: string): boolean {
    const field = this.userStoryForm.get(fieldValue);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  // Récupérer le message d'erreur spécifique
  getErrorMessage(fieldValue: string): string {
    const field = this.userStoryForm.get(fieldValue);
    if (!field) return '';

    if (field.errors?.['required']) {
      return 'Ce champ est obligatoire';
    }
    if (field.errors?.['minlength']) {
      return `Longueur minimale de ${field.errors['minlength'].requiredLength} caractères`;
    }
    if (field.errors?.['maxlength']) {
      return `Longueur maximale de ${field.errors['maxlength'].requiredLength} caractères`;
    }
    return '';
  }

  onSubmit(): void {
    // Marquer le formulaire comme touché pour afficher toutes les erreurs
    this.userStoryForm.markAllAsTouched();

    // Vérification finale de la validité du formulaire
    if (this.userStoryForm.invalid) {
      return;
    }

    // Désactiver le bouton et réinitialiser l'erreur
    this.isSubmitting = true;
    this.submitError = null;

    const userStory: UserStory = {
      ...this.userStoryForm.value,
      id: 0, // L'ID sera généré par le backend
      createdAt: new Date().toISOString() // Convertir en chaîne ISO
    };

    this.userStoryService.createUserStory(userStory)
      .pipe(finalize(() => {
        // Réactiver le bouton
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          // Redirection après création réussie
          this.router.navigate(['/backlog']);
        },
        error: (error) => {
          // Gestion des erreurs
          console.error('Erreur lors de la création:', error);
          this.submitError = 'Impossible de créer la user story. Veuillez réessayer.';
        }
      });
      console.log("the added US is: ", userStory);
  }

  onCancel(): void {
    this.router.navigate(['/backlog']);
  }
}