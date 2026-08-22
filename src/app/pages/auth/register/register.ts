import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService
        .register({
          username: this.registerForm.value.username!,
          password: this.registerForm.value.password!,
        })
        .subscribe({
          next: () => {
            alert('Account created. You are signed in with read-only access.');
            this.router.navigate(['/']);
          },
          error: (err) => {
            alert('Registration failed: ' + err.message);
          },
        });
    } else {
      alert('Username must be at least 3 characters and password at least 6 characters');
    }
  }
}
