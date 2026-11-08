import { Injectable } from '@angular/core';
import { EUserRole, IUser } from 'coffee-shared-lib';
import { delay, Observable, of, throwError } from 'rxjs';
import { IAuthResponse, ILoginCredentials, IRegisterCredentials } from '../models/auth.model';

/**
 * In-memory mock "database" shared with the Auth MFE only.
 * In a real project this would call an actual HTTP API.
 */
const MOCK_USERS: IUser[] = [
  {
    id: 'admin-001',
    email: 'admin@admin.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: EUserRole.ADMIN,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'user-001',
    email: 'user@user.com',
    password: 'user123',
    fullName: 'Regular User',
    role: EUserRole.USER,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly NETWORK_DELAY = 1000;

  /** Authenticate with email + password. */
  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    return new Observable<IAuthResponse>((observer) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password,
        );

        if (!user) {
          observer.error({ message: 'Invalid email or password' });
          return;
        }

        const safeUser: IUser = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        observer.next({
          user: safeUser,
          token: `mock-jwt-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
        });
        observer.complete();
      }, this.NETWORK_DELAY);
    });
  }

  /** Register a new user account. */
  register(credentials: IRegisterCredentials): Observable<IAuthResponse> {
    return new Observable<IAuthResponse>((observer) => {
      setTimeout(() => {
        const existing = MOCK_USERS.find((u) => u.email === credentials.email);
        if (existing) {
          observer.error({ message: 'Email already in use' });
          return;
        }

        const newUser: IUser = {
          id: `user-${Date.now()}`,
          email: credentials.email,
          fullName: credentials.fullName,
          role: EUserRole.USER,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        MOCK_USERS.push({ ...newUser, password: credentials.password });

        observer.next({
          user: newUser,
          token: `mock-jwt-token-${newUser.id}`,
          refreshToken: `mock-refresh-token-${newUser.id}`,
        });
        observer.complete();
      }, this.NETWORK_DELAY);
    });
  }

  /** Sign the user out. */
  logout(): Observable<void> {
    return of(undefined as void).pipe(delay(300));
  }

  /** Validate an existing token and return the associated user. */
  validateToken(token: string): Observable<IUser> {
    return new Observable<IUser>((observer) => {
      setTimeout(() => {
        if (!token || !token.startsWith('mock-jwt-token-')) {
          observer.error({ message: 'Invalid token' });
          return;
        }

        const userId = token.replace('mock-jwt-token-', '');
        const user = MOCK_USERS.find((u) => u.id === userId);

        if (!user) {
          observer.error({ message: 'User not found for given token' });
          return;
        }

        observer.next({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        observer.complete();
      }, 500);
    });
  }

  /** Attempt a token refresh — not implemented in mock, always fails. */
  refreshToken(): Observable<IAuthResponse> {
    return throwError(() => ({ message: 'Token refresh not implemented in mock' }));
  }
}
