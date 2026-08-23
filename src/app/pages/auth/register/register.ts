import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { errorMessage } from '../../../utils/http-error';
import { NotificationService } from '../../../services/notification-service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
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
    private notify: NotificationService,
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
            this.notify.success('Account created. You are signed in with read-only access.');
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.notify.error('Registration failed: ' + errorMessage(err));
          },
        });
    } else {
      this.notify.error(
        'Username must be at least 3 characters and password at least 6 characters',
      );
    }
  }
}
