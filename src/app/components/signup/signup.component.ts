import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'clb-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  registerForm!: FormGroup;
  messageErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: SignupComponent.matchPasswords });
  }

  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  async onSubmit() {
    this.messageErrors = [];

    if (this.registerForm.hasError('passwordMismatch')) {
      this.messageErrors.push("Les mots de passe ne correspondent pas");
    }

    if (this.registerForm.get('email')?.hasError('required')) {
      this.messageErrors.push("L'adresse email est requise");
    }
    if (this.registerForm.get('email')?.hasError('email')) {
      this.messageErrors.push("L'adresse email n'est pas valide");
    }
    if (this.registerForm.get('password')?.hasError('required')) {
      this.messageErrors.push('Le mot de passe est requis');
    }
    if (this.registerForm.get('password')?.hasError('minlength')) {
      this.messageErrors.push('Le mot de passe doit avoir au moins 6 caractères');
    }

    if (this.registerForm.invalid) {
      return;
    }

    if (this.registerForm.valid) {
      try {
        const { email, password } = this.registerForm.value;
        await this.authService.register(email, password);
        await this.router.navigate(['']);
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
      }
    }
  }

  static matchPasswords(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }
}