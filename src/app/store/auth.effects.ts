import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EUserRole } from 'coffee-shared-lib';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';
import * as AuthActions from './auth.actions';

/**
 * Storage key constants — kept in sync with the Shell App's StorageService usage.
 */
const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_REFRESH_TOKEN = 'auth_refresh_token';
const STORAGE_KEY_USER = 'auth_user';

/**
 * Auth MFE NgRx Effects.
 *
 * Responsibilities:
 * 1. Handle async login / register / logout operations via AuthRepository.
 * 2. Persist auth tokens to localStorage (via key names matching the Shell App's
 *    StorageService keys so the Shell can hydrate its global auth slice on startup).
 * 3. Dispatch global Shell auth actions so the singleton NgRx store stays in sync.
 *    The global actions live on the shared 'authGlobal' feature slice provided by the
 *    Shell App — we import them at runtime via dynamic string-based action creators to
 *    avoid a hard compile-time dependency on the Shell's codebase.
 *
 * NOTE: The Shell App provides the NgRx Store as a singleton shared dependency via
 * Module Federation. When the Auth MFE injects `Store`, it receives the SAME store
 * instance as the Shell, so any dispatch automatically reaches global reducers too.
 */
@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly repository = inject(AuthRepository);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  // ─── Login ─────────────────────────────────────────────────────────────────

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authLogin),
      switchMap(({ credentials }) =>
        this.repository.login(credentials).pipe(
          map((response) => {
            this.persistToStorage(response.token, response.refreshToken ?? null, response.user);
            this.dispatchGlobalLoginSuccess(response.token, response.refreshToken ?? null, response.user);

            const targetRoute =
              response.user.role === EUserRole.ADMIN ? '/admin' : '/products';
            this.router.navigate([targetRoute]);

            return AuthActions.authLoginSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.authLoginFailure({ error: error.message ?? 'Login failed' })),
          ),
        ),
      ),
    ),
  );

  // ─── Register ──────────────────────────────────────────────────────────────

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authRegister),
      switchMap(({ credentials }) =>
        this.repository.register(credentials).pipe(
          map((response) => {
            this.persistToStorage(response.token, response.refreshToken ?? null, response.user);
            this.dispatchGlobalRegisterSuccess(response.token, response.refreshToken ?? null, response.user);
            this.router.navigate(['/products']);
            return AuthActions.authRegisterSuccess({ response });
          }),
          catchError((error) =>
            of(
              AuthActions.authRegisterFailure({ error: error.message ?? 'Registration failed' }),
            ),
          ),
        ),
      ),
    ),
  );

  // ─── Logout ────────────────────────────────────────────────────────────────

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authLogout),
      switchMap(() =>
        this.repository.logout().pipe(
          map(() => {
            this.clearStorage();
            this.dispatchGlobalLogout();
            this.router.navigate(['/auth/login']);
            return AuthActions.authLogoutSuccess();
          }),
          catchError(() => {
            this.clearStorage();
            this.dispatchGlobalLogout();
            this.router.navigate(['/auth/login']);
            return of(AuthActions.authLogoutSuccess());
          }),
        ),
      ),
    ),
  );

  // ─── Hydrate from storage ──────────────────────────────────────────────────

  hydrate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authHydrate),
      map(() => {
        const token = this.readFromStorage<string>(STORAGE_KEY_TOKEN);
        const refreshToken = this.readFromStorage<string>(STORAGE_KEY_REFRESH_TOKEN);
        const user = this.readFromStorage<ReturnType<typeof JSON.parse>>(STORAGE_KEY_USER);
        return AuthActions.authHydrateSuccess({ token, refreshToken, user });
      }),
    ),
  );

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Persist token + user to localStorage.
   * Key names are kept in sync with the Shell App's StorageService so the Shell
   * can read them when it bootstraps without requiring a separate API call.
   */
  private persistToStorage(
    token: string,
    refreshToken: string | null,
    user: object,
  ): void {
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, JSON.stringify(refreshToken));
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {
      // localStorage may be unavailable in some environments
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // noop
    }
  }

  private readFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  }

  /**
   * Dispatch to the global Shell auth slice.
   *
   * The Shell App shares the NgRx Store as a singleton via Module Federation.
   * We use plain `{ type }` action objects to avoid importing Shell source files
   * at compile time — the reducer registered under 'auth' in the Shell will handle them.
   *
   * Action type strings match those defined in:
   *   CoffeeWorkshop/src/app/core/store/auth/auth.actions.ts
   */
  private dispatchGlobalLoginSuccess(
    token: string,
    refreshToken: string | null,
    user: object,
  ): void {
    this.store.dispatch({
      type: '[Auth] Login Success',
      token,
      refreshToken: refreshToken ?? '',
      user,
    });
  }

  private dispatchGlobalRegisterSuccess(
    token: string,
    refreshToken: string | null,
    user: object,
  ): void {
    this.store.dispatch({
      type: '[Auth] Register Success',
      token,
      refreshToken: refreshToken ?? '',
      user,
    });
  }

  private dispatchGlobalLogout(): void {
    this.store.dispatch({ type: '[Auth] Logout Success' });
  }
}
