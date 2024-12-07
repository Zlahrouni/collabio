import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'clb-username-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './username-dialog.component.html',
  styleUrls: ['./username-dialog.component.scss']
})

export class UsernameDialogComponent {
  usernameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef<string>
  ) {
    this.usernameForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    if (this.usernameForm.valid) {
      this.dialogRef.close(this.usernameForm.value.username);
    }
  }
}