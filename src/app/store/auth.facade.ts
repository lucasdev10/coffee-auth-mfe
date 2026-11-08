import { inject, Injectable } from '@angular/core';
import { IUser } from 'coffee-shared-lib';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ILoginCredentials, IRegisterCredentials } from '../models/auth.model';
import { IAuthState } from './auth.state';
import * as AuthActions from './auth.actions';
import {
  selectAuthError,
  selectAuthIsAuthenticated,
  selectAuthIsLoading,
  selectAuthIsAdmin,
  selectAuthToken,
  selectAuthUser,
} from './auth.selectors';

/**
 * AuthFacade — public surface for pages to interact with the Auth NgRx store.
 *
 * Pages only reference the facade; they never import store internals directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store<{ auth: IAuthState }>);

  // ─── Selectors ─────────────────────────────────────────────────────────────
  readonly isLoading$: Observable<boolean> = this.store.select(selectAuthIsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectAuthError);
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectAuthIsAuthenticated);
  readonly isAdmin$: Observable<boolean> = this.store.select(selectAuthIsAdmin);
  readonly user$: Observable<IUser | null> = this.store.select(selectAuthUser);
  readonly token$: Observable<string | null> = this.store.select(selectAuthToken);

  // ─── Commands ──────────────────────────────────────────────────────────────

  /** Dispatch login action — AuthEffects will call the repository and persist token. */
  login(credentials: ILoginCredentials): void {
    this.store.dispatch(AuthActions.authLogin({ credentials }));
  }

  /** Dispatch register action — AuthEffects will call the repository and persist token. */
  register(credentials: IRegisterCredentials): void {
    this.store.dispatch(AuthActions.authRegister({ credentials }));
  }

  /** Dispatch logout action — AuthEffects will clear storage and redirect. */
  logout(): void {
    this.store.dispatch(AuthActions.authLogout());
  }

  /** Update token (e.g. after a silent refresh from the Shell). */
  updateToken(token: string, refreshToken?: string): void {
    this.store.dispatch(AuthActions.authUpdateToken({ token, refreshToken }));
  }

  /** Trigger hydration from localStorage (called on MFE bootstrap). */
  hydrate(): void {
    this.store.dispatch(AuthActions.authHydrate());
  }

  /** Clear any displayed error message. */
  clearError(): void {
    this.store.dispatch(AuthActions.authClearError());
  }
}
