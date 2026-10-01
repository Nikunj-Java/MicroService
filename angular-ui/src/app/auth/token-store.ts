import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStore {
  private readonly storageTokenKey ='mission-ui-token';

  private readonly storageUsernameKey ='mission-ui-username';

  private readonly token =signal<string | null>(localStorage.getItem(this.storageTokenKey));

  private readonly username =signal<string | null>(localStorage.getItem(this.storageUsernameKey));

  private readonly roles =signal<string[]>(this.readRoles(localStorage.getItem(this.storageTokenKey)));

  readonly isAuthenticated =computed(() => this.token() !== null);

  readonly currentUsername =this.username.asReadonly();

  readonly currentRoles =this.roles.asReadonly();

  readonly canViewAccounts =computed(() =>
    this.hasAnyRole('MISSION_ADMIN', 'MISSION_OPERATOR', 'MISSION_VIEW')
  );

  readonly canEditAccounts =computed(() =>
    this.hasAnyRole('MISSION_ADMIN', 'MISSION_OPERATOR')
  );

  readonly canDeleteAccounts =computed(() =>
    this.hasAnyRole('MISSION_ADMIN')
  );

  setToken(token: string, username: string): void {
    this.token.set(token);
    this.username.set(username);
    this.roles.set(this.readRoles(token));
    localStorage.setItem(this.storageTokenKey, token);
    localStorage.setItem(this.storageUsernameKey, username);
  }

  getToken(): string | null {
    return this.token();
  }

  hasAnyRole(...roles: string[]): boolean {
    const assignedRoles = this.roles();
    return roles.some((role) => assignedRoles.includes(role));
  }

  clear(): void {
    this.token.set(null);
    this.username.set(null);
    this.roles.set([]);
    localStorage.removeItem(this.storageTokenKey);
    localStorage.removeItem(this.storageUsernameKey);
  }

  private readRoles(token: string | null): string[] {
    if (!token) {
      return [];
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return [];
    }

    const roles = payload['roles'];
    if (Array.isArray(roles)) {
      return roles.filter((role): role is string => typeof role === 'string');
    }

    const authorities = payload['authorities'];
    if (Array.isArray(authorities)) {
      return authorities.filter((role): role is string => typeof role === 'string');
    }

    if (typeof roles === 'string') {
      return roles.split(',').map((role) => role.trim()).filter(Boolean);
    }

    return [];
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const normalized = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
