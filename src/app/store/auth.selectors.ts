import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IAuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<IAuthState>('auth');

export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);

export const selectAuthRefreshToken = createSelector(
  selectAuthState,
  (state) => state.refreshToken,
);

export const selectAuthUser = createSelector(selectAuthState, (state) => state.user);

export const selectAuthIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated,
);

export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);

export const selectAuthIsLoading = createSelector(
  selectAuthState,
  (state) => state.loading === 'pending',
);

export const selectAuthError = createSelector(selectAuthState, (state) => state.error);

export const selectAuthUserRole = createSelector(selectAuthUser, (user) => user?.role ?? null);

export const selectAuthIsAdmin = createSelector(
  selectAuthUserRole,
  (role) => role === 'ADMIN',
);
