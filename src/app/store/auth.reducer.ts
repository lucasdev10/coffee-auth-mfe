import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.authLogin, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(AuthActions.authLoginSuccess, (state, { response }) => ({
    ...state,
    token: response.token,
    refreshToken: response.refreshToken ?? null,
    user: response.user,
    isAuthenticated: true,
    loading: 'success' as const,
    error: null,
  })),
  on(AuthActions.authLoginFailure, (state, { error }) => ({
    ...state,
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    loading: 'error' as const,
    error,
  })),

  // Register
  on(AuthActions.authRegister, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(AuthActions.authRegisterSuccess, (state, { response }) => ({
    ...state,
    token: response.token,
    refreshToken: response.refreshToken ?? null,
    user: response.user,
    isAuthenticated: true,
    loading: 'success' as const,
    error: null,
  })),
  on(AuthActions.authRegisterFailure, (state, { error }) => ({
    ...state,
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    loading: 'error' as const,
    error,
  })),

  // Logout
  on(AuthActions.authLogout, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(AuthActions.authLogoutSuccess, (state) => ({
    ...state,
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    loading: 'idle' as const,
    error: null,
  })),
  on(AuthActions.authLogoutFailure, (state, { error }) => ({
    ...state,
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    loading: 'error' as const,
    error,
  })),

  // Update token
  on(AuthActions.authUpdateToken, (state, { token, refreshToken }) => ({
    ...state,
    token,
    refreshToken: refreshToken ?? state.refreshToken,
  })),

  // Hydrate from storage
  on(AuthActions.authHydrateSuccess, (state, { token, refreshToken, user }) => ({
    ...state,
    token,
    refreshToken,
    user,
    isAuthenticated: !!(token && user),
    loading: 'idle' as const,
    error: null,
  })),

  // Clear error
  on(AuthActions.authClearError, (state) => ({
    ...state,
    error: null,
  })),
);
