import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HoldingSummary } from './holding-summary/holding-summary';
import { UserComponent } from './user-component/user-component';
import { TokenStore } from './auth/token-store';


@Component({
  imports: [RouterOutlet, HoldingSummary,UserComponent,RouterLink,RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('angular-ui');
  protected readonly tokenStore =inject(TokenStore);
  protected readonly currentRoleLabel = computed(() => {
    const roles = this.tokenStore.currentRoles();
    return roles.length ? roles.join(', ') : 'No role';
  });

  private readonly router =inject(Router);


  logout(): void {
    this.tokenStore.clear();
    this.router.navigate(['/login']);
  }
}
