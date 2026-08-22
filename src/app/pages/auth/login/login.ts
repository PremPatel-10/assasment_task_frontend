import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { errorMessage } from '../../../utils/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .login({
          username: this.loginForm.value.username!,
          password: this.loginForm.value.password!,
        })
        .subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
            this.router.navigateByUrl(returnUrl);
          },
          error: (err) => {
            alert('Login failed: ' + errorMessage(err));
          },
        });
    } else {
      alert('Please provide username and password');
    }
  }
}
