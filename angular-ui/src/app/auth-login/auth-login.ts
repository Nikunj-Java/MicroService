import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenStore } from '../auth/token-store';
import { Router } from '@angular/router';
import { LoginService } from '../service/login-service';

@Component({
  imports: [FormsModule],
  selector: 'app-auth-login',
  styleUrl: './auth-login.css',
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  private readonly authService = inject(LoginService);
  private readonly tokenStore = inject(TokenStore);
  private readonly router = inject(Router);

  submit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required.';
      return;
    }
    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService
      .login(this.username.trim(), this.password)
      .subscribe({
        next: (response) => {
          this.tokenStore.setToken(response.accessToken, this.username.trim());

          this.isSubmitting = false;
          alert('Token generated successfully.');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage =
            error?.error?.message ??
            error?.message ??
            'Invalid username or password.';
        }
      });

  }
  
}
