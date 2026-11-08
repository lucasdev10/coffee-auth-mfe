import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { EUserRole } from 'coffee-shared-lib';
import { IAuthResponse } from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repository';
import { EventBusService } from '../services/event-bus.service';
import { AuthEffects } from './auth.effects';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

const ADMIN_USER = { ...MOCK_USER, id: 'admin-001', role: EUserRole.ADMIN };

const MOCK_AUTH_RESPONSE: IAuthResponse = {
  user: MOCK_USER,
  token: 'mock-token-123',
  refreshToken: 'mock-refresh-123',
};

const ADMIN_AUTH_RESPONSE: IAuthResponse = {
  user: ADMIN_USER,
  token: 'admin-token-456',
  refreshToken: 'admin-refresh-456',
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;
  let repository: AuthRepository;
  let store: MockStore;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let eventBus: EventBusService;

  beforeEach(async () => {
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        AuthRepository,
        EventBusService,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { auth: initialAuthState } }),
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    effects = TestBed.inject(AuthEffects);
    repository = TestBed.inject(AuthRepository);
    store = TestBed.inject(MockStore);
    eventBus = TestBed.inject(EventBusService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Login ────────────────────────────────────────────────────────────────

  describe('login$', () => {
    it('should dispatch authLoginSuccess and navigate to /products on successful USER login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'user@test.com', password: 'user123' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authLoginSuccess({ response: MOCK_AUTH_RESPONSE }));
          expect(router.navigate).toHaveBeenCalledWith(['/products']);
          resolve();
        });
      });
    });

    it('should navigate to /admin after successful ADMIN login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(of(ADMIN_AUTH_RESPONSE));
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'admin@test.com', password: 'admin123' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authLoginSuccess({ response: ADMIN_AUTH_RESPONSE }));
          expect(router.navigate).toHaveBeenCalledWith(['/admin']);
          resolve();
        });
      });
    });

    it('should dispatch authLoginFailure on login error', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(
        throwError(() => ({ message: 'Invalid credentials' })),
      );
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'bad@test.com', password: 'wrong' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authLoginFailure({ error: 'Invalid credentials' }));
          resolve();
        });
      });
    });

    it('should persist token to localStorage on successful login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'user@test.com', password: 'user123' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe(() => {
          expect(localStorageSpy).toHaveBeenCalledWith('auth_token', JSON.stringify(MOCK_AUTH_RESPONSE.token));
          expect(localStorageSpy).toHaveBeenCalledWith('auth_user', JSON.stringify(MOCK_AUTH_RESPONSE.user));
          resolve();
        });
      });
    });

    it('should dispatch global Shell Login Success action on successful login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      const storeSpy = vi.spyOn(store, 'dispatch');
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'user@test.com', password: 'user123' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe(() => {
          // The local MFE action + the global Shell action both get dispatched
          const dispatchedTypes = storeSpy.mock.calls.map((call) => (call[0] as any).type);
          expect(dispatchedTypes).toContain('[Auth] Login Success');
          resolve();
        });
      });
    });

    it('should emit "auth:login" custom event with user and token on successful login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      const emitSpy = vi.spyOn(eventBus, 'emit');
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'user@test.com', password: 'user123' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe(() => {
          expect(emitSpy).toHaveBeenCalledWith(
            'auth:login',
            expect.objectContaining({
              user: expect.objectContaining({ id: MOCK_USER.id, email: MOCK_USER.email }),
              token: MOCK_AUTH_RESPONSE.token,
            }),
            'auth-mfe',
          );
          resolve();
        });
      });
    });

    it('should NOT emit "auth:login" event on failed login', async () => {
      vi.spyOn(repository, 'login').mockReturnValue(
        throwError(() => ({ message: 'Invalid credentials' })),
      );
      const emitSpy = vi.spyOn(eventBus, 'emit');
      actions$ = of(
        AuthActions.authLogin({ credentials: { email: 'bad@test.com', password: 'wrong' } }),
      );

      await new Promise<void>((resolve) => {
        effects.login$.subscribe(() => {
          expect(emitSpy).not.toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  // ─── Register ─────────────────────────────────────────────────────────────

  describe('register$', () => {
    it('should dispatch authRegisterSuccess and navigate to /products on successful register', async () => {
      vi.spyOn(repository, 'register').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      actions$ = of(
        AuthActions.authRegister({
          credentials: {
            email: 'new@test.com',
            password: 'pass123',
            confirmPassword: 'pass123',
            fullName: 'New User',
          },
        }),
      );

      await new Promise<void>((resolve) => {
        effects.register$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authRegisterSuccess({ response: MOCK_AUTH_RESPONSE }));
          expect(router.navigate).toHaveBeenCalledWith(['/products']);
          resolve();
        });
      });
    });

    it('should dispatch authRegisterFailure when email already in use', async () => {
      vi.spyOn(repository, 'register').mockReturnValue(
        throwError(() => ({ message: 'Email already in use' })),
      );
      actions$ = of(
        AuthActions.authRegister({
          credentials: {
            email: 'existing@test.com',
            password: 'pass123',
            confirmPassword: 'pass123',
            fullName: 'Existing User',
          },
        }),
      );

      await new Promise<void>((resolve) => {
        effects.register$.subscribe((action) => {
          expect(action).toEqual(
            AuthActions.authRegisterFailure({ error: 'Email already in use' }),
          );
          resolve();
        });
      });
    });

    it('should dispatch global Shell Register Success action on successful register', async () => {
      vi.spyOn(repository, 'register').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      const storeSpy = vi.spyOn(store, 'dispatch');
      actions$ = of(
        AuthActions.authRegister({
          credentials: {
            email: 'new@test.com',
            password: 'pass123',
            confirmPassword: 'pass123',
            fullName: 'New User',
          },
        }),
      );

      await new Promise<void>((resolve) => {
        effects.register$.subscribe(() => {
          const dispatchedTypes = storeSpy.mock.calls.map((call) => (call[0] as any).type);
          expect(dispatchedTypes).toContain('[Auth] Register Success');
          resolve();
        });
      });
    });

    it('should emit "auth:login" custom event with user and token on successful register', async () => {
      vi.spyOn(repository, 'register').mockReturnValue(of(MOCK_AUTH_RESPONSE));
      const emitSpy = vi.spyOn(eventBus, 'emit');
      actions$ = of(
        AuthActions.authRegister({
          credentials: {
            email: 'new@test.com',
            password: 'pass123',
            confirmPassword: 'pass123',
            fullName: 'New User',
          },
        }),
      );

      await new Promise<void>((resolve) => {
        effects.register$.subscribe(() => {
          expect(emitSpy).toHaveBeenCalledWith(
            'auth:login',
            expect.objectContaining({
              user: expect.objectContaining({ id: MOCK_USER.id, email: MOCK_USER.email }),
              token: MOCK_AUTH_RESPONSE.token,
            }),
            'auth-mfe',
          );
          resolve();
        });
      });
    });
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  describe('logout$', () => {
    it('should dispatch authLogoutSuccess and navigate to /auth/login', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(of(undefined as void));
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authLogoutSuccess());
          expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
          resolve();
        });
      });
    });

    it('should still dispatch authLogoutSuccess even when logout API call fails', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(
        throwError(() => new Error('Network error')),
      );
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe((action) => {
          expect(action).toEqual(AuthActions.authLogoutSuccess());
          expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
          resolve();
        });
      });
    });

    it('should clear localStorage on logout', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(of(undefined as void));
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe(() => {
          expect(removeItemSpy).toHaveBeenCalledWith('auth_token');
          expect(removeItemSpy).toHaveBeenCalledWith('auth_user');
          resolve();
        });
      });
    });

    it('should dispatch global Shell Logout Success action on logout', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(of(undefined as void));
      const storeSpy = vi.spyOn(store, 'dispatch');
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe(() => {
          const dispatchedTypes = storeSpy.mock.calls.map((call) => (call[0] as any).type);
          expect(dispatchedTypes).toContain('[Auth] Logout Success');
          resolve();
        });
      });
    });

    it('should emit "auth:logout" custom event on successful logout', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(of(undefined as void));
      const emitSpy = vi.spyOn(eventBus, 'emit');
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe(() => {
          expect(emitSpy).toHaveBeenCalledWith('auth:logout', {}, 'auth-mfe');
          resolve();
        });
      });
    });

    it('should emit "auth:logout" custom event even when logout API call fails', async () => {
      vi.spyOn(repository, 'logout').mockReturnValue(
        throwError(() => new Error('Network error')),
      );
      const emitSpy = vi.spyOn(eventBus, 'emit');
      actions$ = of(AuthActions.authLogout());

      await new Promise<void>((resolve) => {
        effects.logout$.subscribe(() => {
          expect(emitSpy).toHaveBeenCalledWith('auth:logout', {}, 'auth-mfe');
          resolve();
        });
      });
    });
  });

  // ─── Hydrate from storage ─────────────────────────────────────────────────

  describe('hydrate$', () => {
    it('should dispatch authHydrateSuccess with token and user from localStorage', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
        const data: Record<string, string> = {
          auth_token: JSON.stringify('stored-token'),
          auth_refresh_token: JSON.stringify('stored-refresh'),
          auth_user: JSON.stringify(MOCK_USER),
        };
        return data[key] ?? null;
      });

      actions$ = of(AuthActions.authHydrate());

      await new Promise<void>((resolve) => {
        effects.hydrate$.subscribe((action) => {
          expect(action).toEqual(
            AuthActions.authHydrateSuccess({
              token: 'stored-token',
              refreshToken: 'stored-refresh',
              user: MOCK_USER,
            }),
          );
          resolve();
        });
      });
    });

    it('should dispatch authHydrateSuccess with nulls when localStorage is empty', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      actions$ = of(AuthActions.authHydrate());

      await new Promise<void>((resolve) => {
        effects.hydrate$.subscribe((action) => {
          expect(action).toEqual(
            AuthActions.authHydrateSuccess({ token: null, refreshToken: null, user: null }),
          );
          resolve();
        });
      });
    });
  });
});
