import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ILoginCredentials, IRegisterCredentials } from '../models/auth.model';

/**
 * AuthFacade - Minimal placeholder for Auth MFE pages.
 *
 * This facade will be fully implemented in task 7.4 with NgRx store,
 * AuthEffects, global store synchronization, and StorageService persistence.
 * For task 7.3, this provides the interface that LoginPage and RegisterPage
 * depend on so the pages compile correctly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly router = inject(Router);

  private readonly _isLoading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();
  readonly error$: Observable<string | null> = this._error.asObservable();

  login(credentials: ILoginCredentials): void {
    // Will be implemented in task 7.4 - dispatches NgRx login action
    this._isLoading.next(true);
    this._error.next(null);
    console.warn('AuthFacade.login: NgRx integration pending (task 7.4)', credentials);
  }

  register(credentials: IRegisterCredentials): void {
    // Will be implemented in task 7.4 - dispatches NgRx register action
    this._isLoading.next(true);
    this._error.next(null);
    console.warn('AuthFacade.register: NgRx integration pending (task 7.4)', credentials);
  }

  logout(): void {
    // Will be implemented in task 7.4
    this._error.next(null);
    this.router.navigate(['/auth/login']);
  }
}
