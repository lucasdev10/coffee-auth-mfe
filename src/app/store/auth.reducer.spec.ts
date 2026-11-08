import { describe, it, expect } from 'vitest';
import { authReducer } from './auth.reducer';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';
import { EUserRole } from 'coffee-shared-lib';
import { IAuthResponse } from '../models/auth.model';

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

const MOCK_RESPONSE: IAuthResponse = {
  user: MOCK_USER,
  token: 'mock-token-123',
  refreshToken: 'mock-refresh-123',
};

describe('authReducer', () => {
  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialAuthState);
  });

  // ─── Login ─────────────────────────────────────────────────────────────────

  it('should set loading to pending on authLogin', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authLogin({ credentials: { email: 'x@x.com', password: '123' } }),
    );
    expect(state.loading).toBe('pending');
    expect(state.error).toBeNull();
  });

  it('should set authenticated state on authLoginSuccess', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authLoginSuccess({ response: MOCK_RESPONSE }),
    );
    expect(state.token).toBe(MOCK_RESPONSE.token);
    expect(state.refreshToken).toBe(MOCK_RESPONSE.refreshToken);
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe('success');
    expect(state.error).toBeNull();
  });

  it('should set error state on authLoginFailure', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authLoginFailure({ error: 'Invalid credentials' }),
    );
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe('error');
    expect(state.error).toBe('Invalid credentials');
  });

  // ─── Register ──────────────────────────────────────────────────────────────

  it('should set loading to pending on authRegister', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authRegister({
        credentials: {
          email: 'new@x.com',
          password: 'pass123',
          confirmPassword: 'pass123',
          fullName: 'New User',
        },
      }),
    );
    expect(state.loading).toBe('pending');
  });

  it('should set authenticated state on authRegisterSuccess', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authRegisterSuccess({ response: MOCK_RESPONSE }),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(MOCK_RESPONSE.token);
    expect(state.loading).toBe('success');
  });

  it('should set error state on authRegisterFailure', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authRegisterFailure({ error: 'Email already in use' }),
    );
    expect(state.loading).toBe('error');
    expect(state.error).toBe('Email already in use');
    expect(state.isAuthenticated).toBe(false);
  });

  // ─── Logout ────────────────────────────────────────────────────────────────

  it('should set loading to pending on authLogout', () => {
    const loggedInState = {
      ...initialAuthState,
      token: 'some-token',
      user: MOCK_USER,
      isAuthenticated: true,
    };
    const state = authReducer(loggedInState, AuthActions.authLogout());
    expect(state.loading).toBe('pending');
  });

  it('should clear auth state on authLogoutSuccess', () => {
    const loggedInState = {
      ...initialAuthState,
      token: 'some-token',
      user: MOCK_USER,
      isAuthenticated: true,
    };
    const state = authReducer(loggedInState, AuthActions.authLogoutSuccess());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe('idle');
    expect(state.error).toBeNull();
  });

  // ─── Update Token ──────────────────────────────────────────────────────────

  it('should update the token on authUpdateToken', () => {
    const state = authReducer(
      { ...initialAuthState, token: 'old-token' },
      AuthActions.authUpdateToken({ token: 'new-token', refreshToken: 'new-refresh' }),
    );
    expect(state.token).toBe('new-token');
    expect(state.refreshToken).toBe('new-refresh');
  });

  it('should preserve existing refreshToken when authUpdateToken omits it', () => {
    const state = authReducer(
      { ...initialAuthState, token: 'old', refreshToken: 'existing-refresh' },
      AuthActions.authUpdateToken({ token: 'new-token' }),
    );
    expect(state.refreshToken).toBe('existing-refresh');
  });

  // ─── Hydrate ───────────────────────────────────────────────────────────────

  it('should hydrate auth state from storage on authHydrateSuccess', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authHydrateSuccess({
        token: 'hydrated-token',
        refreshToken: 'hydrated-refresh',
        user: MOCK_USER,
      }),
    );
    expect(state.token).toBe('hydrated-token');
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe('idle');
  });

  it('should set isAuthenticated to false when hydrating with null token', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.authHydrateSuccess({ token: null, refreshToken: null, user: null }),
    );
    expect(state.isAuthenticated).toBe(false);
  });

  // ─── Clear Error ───────────────────────────────────────────────────────────

  it('should clear error on authClearError', () => {
    const stateWithError = { ...initialAuthState, error: 'Some error' };
    const state = authReducer(stateWithError, AuthActions.authClearError());
    expect(state.error).toBeNull();
  });
});
