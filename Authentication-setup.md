# Angular Authentication Setup Guide

This guide explains how to implement JWT-based authentication in an Angular application using these building blocks:

1. `token-store`
2. `auth-interceptor`
3. `auth-guard`
4. login service and login page integration
5. app-level wiring

The examples use Angular standalone APIs because this project is already using them. The same idea also works in module-based Angular apps.

## 1. Goal

The authentication flow is:

1. User enters `username` and `password`.
2. Angular sends them to the backend login API.
3. Backend returns a JWT token.
4. Angular stores that token.
5. Every later API request automatically sends `Authorization: Bearer <token>`.
6. Protected pages are blocked when the user is not logged in.
7. Logout clears the token and sends the user back to login.

## 2. Recommended Folder Structure

Create an auth folder like this:

```text
src/app/auth/
  auth-guard.ts
  auth-interceptor.ts
  token-store.ts
```


## 3. Step 1: Create the Token Store

Purpose:

- keep the token in one place
- expose login state to the UI
- persist the token across page refreshes
- provide helper methods for setting and clearing auth state

Create `src/app/auth/token-store.ts`:

```
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStore {
  private readonly storageTokenKey =
    'mission-ui-token';

  private readonly storageUsernameKey =
    'mission-ui-username';

  private readonly token =
    signal<string | null>(
      localStorage.getItem(this.storageTokenKey)
    );

  private readonly username =
    signal<string | null>(
      localStorage.getItem(this.storageUsernameKey)
    );

  readonly isAuthenticated =
    computed(() => this.token() !== null);

  readonly currentUsername =
    this.username.asReadonly();

  setToken(token: string, username: string): void {
    this.token.set(token);
    this.username.set(username);
    localStorage.setItem(this.storageTokenKey, token);
    localStorage.setItem(this.storageUsernameKey, username);
  }

  getToken(): string | null {
    return this.token();
  }

  clear(): void {
    this.token.set(null);
    this.username.set(null);
    localStorage.removeItem(this.storageTokenKey);
    localStorage.removeItem(this.storageUsernameKey);
  }
}

```

Explanation:

- `signal()` stores reactive state.
- `computed()` derives whether the user is authenticated.
- `localStorage` makes login survive browser refresh.
- `setToken()` stores both token and username.
- `clear()` removes all auth state during logout.


## 4. Step 2: Create the HTTP Interceptor

Purpose:

- automatically attach the JWT token to outgoing API calls
- avoid repeating header code inside every service

Create `src/app/auth/auth-interceptor.ts`:

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStore } from './token-store';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {
    const tokenStore = inject(TokenStore);
    const token = tokenStore.getToken();

    if (!token) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  };
```

Explanation:

- Angular interceptors run before the request leaves the browser.
- If there is no token, the request is sent unchanged.
- If a token exists, the request is cloned and the `Authorization` header is added.
- This is the cleanest place to centralize JWT header logic.

## 5. Step 3: Register the Interceptor

If you are using standalone Angular, register it in `app.config.ts`.

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

Explanation:

- `provideHttpClient(withInterceptors(...))` activates the interceptor globally.
- Without this step, your token store can work and login can work, but later requests still will not send the JWT.

For module-based Angular, the equivalent is registering an interceptor provider in `AppModule`.

## 6. Step 4: Create the Auth Guard

Purpose:

- block navigation to protected routes when the user is not logged in
- redirect users to the login page

Create `src/app/auth/auth-guard.ts`:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStore } from './token-store';

export const authGuard: CanActivateFn =
  (_route, state) => {
    const tokenStore = inject(TokenStore);
    const router = inject(Router);

    if (tokenStore.isAuthenticated()) {
      return true;
    }

    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          redirectTo: state.url
        }
      }
    );
  };
```

Explanation:

- `CanActivateFn` decides whether the route can open.
- If the user has a token, it returns `true`.
- If not, it redirects to `/login`.
- `redirectTo` is optional but useful when you want to send the user back after a successful login.

Note about `_route`:

- Angular passes the current route as the first argument.
- The underscore means the argument is intentionally unused.
- It is a common TypeScript convention to avoid unused variable warnings.

## 7. Step 5: Protect Routes

Apply the guard to the routes you want to protect.

Example `src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { Accounts } from './accounts/accounts';
import { HoldingsSummary } from './holdings-summary/holdings-summary';
import { MyHoldingSummary } from './my-holding-summary/my-holding-summary';
import { Forms } from './forms/forms';
import { Login } from './login/login';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'accounts',
    component: Accounts,
    canActivate: [authGuard]
  },
  {
    path: 'summary',
    component: HoldingsSummary,
    canActivate: [authGuard]
  },
  {
    path: 'my-holding-summary',
    component: MyHoldingSummary,
    canActivate: [authGuard]
  },
  {
    path: 'forms',
    component: Forms,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

Explanation:

- Keep the login route public.
- Add `canActivate: [authGuard]` to protected routes.
- Add a wildcard redirect so unknown URLs do not bypass the login flow.


## 8. Step 6: Create the Login Service

Purpose:

- send credentials to the backend
- normalize different backend token response shapes

Create `src/app/services/auth-service.ts`:

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

type LoginResponse =
  | { accessToken?: string; token?: string; jwt?: string }
  | string;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(
      'http://localhost:8083/login',
      {
        username,
        password
      }
    ).pipe(
      map((response) => {
        if (typeof response === 'string') {
          return { accessToken: response };
        }

        const accessToken =
          response.accessToken ??
          response.token ??
          response.jwt;

        if (!accessToken) {
          throw new Error('Login response did not contain a token.');
        }

        return { accessToken };
      })
    );
  }
}
```

Explanation:

- Different backends return tokens in different shapes.
- Some APIs return `{ accessToken: '...' }`.
- Others return `{ token: '...' }` or `{ jwt: '...' }`.
- Some return the token as a raw string.
- Normalizing the response here keeps the component simple.


## 9. Step 7: Create the Login Component

Purpose:

- collect username and password
- call the backend login endpoint
- save the returned token
- navigate to a protected page after success

Example `src/app/login/login.ts`:


```ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { TokenStore } from '../auth/token-store';
import { Router } from '@angular/router';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  private readonly authService = inject(AuthService);
  private readonly tokenStore = inject(TokenStore);
  private readonly router = inject(Router);

  submit(): void {
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .login(this.username.trim(), this.password)
      .subscribe({
        next: (response) => {
          this.tokenStore.setToken(
            response.accessToken,
            this.username.trim()
          );

          this.isSubmitting = false;
          alert('Token generated successfully.');
          this.router.navigate(['/accounts']);
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
```


Example `src/app/login/login.html`:

```html
<section class="login-page">
  <form class="login-card" (ngSubmit)="submit()">
    <h1>Login</h1>

    <label for="username">Username</label>
    <input
      id="username"
      name="username"
      type="text"
      [(ngModel)]="username"
      placeholder="Enter username"
      autocomplete="username"
      required
    />

    <label for="password">Password</label>
    <input
      id="password"
      name="password"
      type="password"
      [(ngModel)]="password"
      placeholder="Enter password"
      autocomplete="current-password"
      required
    />

    @if (errorMessage) {
      <p class="error-message">{{ errorMessage }}</p>
    }

    <button type="submit" [disabled]="isSubmitting">
      {{ isSubmitting ? 'Signing in...' : 'Login' }}
    </button>
  </form>
</section>
```

Explanation:

- `[(ngModel)]` binds the input values.
- On success, the token is stored through `TokenStore`.
- After login, the app navigates to a protected route.
- An alert confirms that a token was generated.

## 10. Step:8 Create LogoutButton

in Navigation add the logut button
```
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" routerLink="/accounts">Mission UI</a>
    <!-- 1. Added id selector matching to wire up mobile toggle button -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <!-- 2. Restored the id="navbarSupportedContent" attribute so the mobile menu can actually close/open -->
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <!-- 3. Removed 'active' class so it doesn't look highlighted when you browse to other pages -->
          <a class="nav-link" routerLink="/accounts" routerLinkActive="active">Account</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/summary" routerLinkActive="active">Summary</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/my-holding-summary" routerLinkActive="active">My Holding Summary</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/forms" routerLinkActive="active">Forms</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/login" routerLinkActive="active">Login</a>
        </li>
      </ul>

      @if (tokenStore.isAuthenticated()) {
        <div class="navbar-auth-actions">
          <span class="navbar-text">
            {{ tokenStore.currentUsername() || 'Authenticated user' }}
          </span>
          <button
            type="button"
            class="btn btn-outline-light btn-sm"
            (click)="logout()"
          >
            Logout
          </button>
        </div>
      }
    </div>
  </div>
</nav>



 
<!-- <app-holdings-summary></app-holdings-summary>

@defer {
  <app-my-holding-summary />
} @loading {
  <p>Loading...</p>
}
 
<app-service-component></app-service-component>
<app-accounts></app-accounts> -->


<!-- Routed component appears here -->
<router-outlet></router-outlet>
```

goto ```app.ts``` file

```ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenStore } from './auth/token-store';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],

  selector: 'app-root',
  standalone: true, // Standard in modern Angular
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly tokenStore =
    inject(TokenStore);

  private readonly router =
    inject(Router);

  protected readonly title = signal('mission-ui');

  logout(): void {
    this.tokenStore.clear();
    this.router.navigate(['/login']);
  }
}

```