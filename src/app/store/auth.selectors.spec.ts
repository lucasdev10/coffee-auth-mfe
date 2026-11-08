import { describe, it, expect } from 'vitest';
import {
  selectAuthToken,
  selectAuthRefreshToken,
  selectAuthUser,
  selectAuthIsAuthenticated,
  selectAuthIsLoading,
  selectAuthError,
  selectAuthUserRole,
  selectAuthIsAdmin,
} from './auth.selectors';
import { IAuthState } from './auth.state';
import { EUserRole } from 'coffee-shared-lib';

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

const ADMIN_USER = { ...MOCK_USER, id: 'admin-001', role: EUserRole.ADMIN };

function buildAppState(partial: Partial<IAuthState> = {}): { auth: IAuthState } {
  return {
    auth: {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      loading: 'idle',
      error: null,
      ...partial,
    },
  };
}

describe('Auth Selectors', () => {
  it('selectAuthToken should return token', () => {
    expect(selectAuthToken(buildAppState({ token: 'abc' }))).toBe('abc');
  });

  it('selectAuthRefreshToken should return refreshToken', () => {
    expect(selectAuthRefreshToken(buildAppState({ refreshToken: 'refresh-xyz' }))).toBe(
      'refresh-xyz',
    );
  });

  it('selectAuthUser should return user', () => {
    expect(selectAuthUser(buildAppState({ user: MOCK_USER }))).toEqual(MOCK_USER);
  });

  it('selectAuthIsAuthenticated should reflect isAuthenticated flag', () => {
    expect(selectAuthIsAuthenticated(buildAppState({ isAuthenticated: true }))).toBe(true);
    expect(selectAuthIsAuthenticated(buildAppState({ isAuthenticated: false }))).toBe(false);
  });

  it('selectAuthIsLoading should be true only when loading is pending', () => {
    expect(selectAuthIsLoading(buildAppState({ loading: 'pending' }))).toBe(true);
    expect(selectAuthIsLoading(buildAppState({ loading: 'idle' }))).toBe(false);
    expect(selectAuthIsLoading(buildAppState({ loading: 'success' }))).toBe(false);
    expect(selectAuthIsLoading(buildAppState({ loading: 'error' }))).toBe(false);
  });

  it('selectAuthError should return error string', () => {
    expect(selectAuthError(buildAppState({ error: 'bad credentials' }))).toBe('bad credentials');
    expect(selectAuthError(buildAppState({ error: null }))).toBeNull();
  });

  it('selectAuthUserRole should return user role', () => {
    expect(selectAuthUserRole(buildAppState({ user: MOCK_USER }))).toBe(EUserRole.USER);
    expect(selectAuthUserRole(buildAppState({ user: null }))).toBeNull();
  });

  it('selectAuthIsAdmin should be true only for ADMIN role', () => {
    expect(selectAuthIsAdmin(buildAppState({ user: ADMIN_USER }))).toBe(true);
    expect(selectAuthIsAdmin(buildAppState({ user: MOCK_USER }))).toBe(false);
    expect(selectAuthIsAdmin(buildAppState({ user: null }))).toBe(false);
  });
});
