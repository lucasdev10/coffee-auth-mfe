import { IUser } from 'coffee-shared-lib';

/**
 * Auth MFE local NgRx state.
 * Mirrors the fields of the global Shell auth slice so they can be kept in sync.
 */
export interface IAuthState {
  token: string | null;
  refreshToken: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  loading: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

export const initialAuthState: IAuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  loading: 'idle',
  error: null,
};
