import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthFacade } from './auth.facade';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';
import { EUserRole } from 'coffee-shared-lib';

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        provideMockStore({ initialState: { auth: initialAuthState } }),
      ],
    }).compileComponents();

    facade = TestBed.inject(AuthFacade);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should dispatch authLogin on login()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.login({ email: 'a@b.com', password: '123456' });
    expect(dispatch).toHaveBeenCalledWith(
      AuthActions.authLogin({ credentials: { email: 'a@b.com', password: '123456' } }),
    );
  });

  it('should dispatch authRegister on register()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const creds = {
      email: 'new@b.com',
      password: 'pass',
      confirmPassword: 'pass',
      fullName: 'New User',
    };
    facade.register(creds);
    expect(dispatch).toHaveBeenCalledWith(AuthActions.authRegister({ credentials: creds }));
  });

  it('should dispatch authLogout on logout()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.logout();
    expect(dispatch).toHaveBeenCalledWith(AuthActions.authLogout());
  });

  it('should dispatch authUpdateToken on updateToken()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.updateToken('new-token', 'new-refresh');
    expect(dispatch).toHaveBeenCalledWith(
      AuthActions.authUpdateToken({ token: 'new-token', refreshToken: 'new-refresh' }),
    );
  });

  it('should dispatch authHydrate on hydrate()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.hydrate();
    expect(dispatch).toHaveBeenCalledWith(AuthActions.authHydrate());
  });

  it('should dispatch authClearError on clearError()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.clearError();
    expect(dispatch).toHaveBeenCalledWith(AuthActions.authClearError());
  });

  it('isLoading$ should emit false from initial state', async () => {
    const loading = await new Promise<boolean>((resolve) => {
      facade.isLoading$.subscribe((v) => resolve(v));
    });
    expect(loading).toBe(false);
  });

  it('isAuthenticated$ should emit false from initial state', async () => {
    const auth = await new Promise<boolean>((resolve) => {
      facade.isAuthenticated$.subscribe((v) => resolve(v));
    });
    expect(auth).toBe(false);
  });

  it('should reflect authenticated user after store update', async () => {
    store.setState({
      auth: {
        ...initialAuthState,
        user: MOCK_USER,
        token: 'token-xyz',
        isAuthenticated: true,
      },
    });

    const user = await new Promise((resolve) => {
      facade.user$.subscribe((u) => resolve(u));
    });
    expect(user).toEqual(MOCK_USER);

    const isAuth = await new Promise<boolean>((resolve) => {
      facade.isAuthenticated$.subscribe((v) => resolve(v));
    });
    expect(isAuth).toBe(true);
  });
});
