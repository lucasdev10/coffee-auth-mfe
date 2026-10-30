import { IUser } from 'coffee-shared-lib';

/**
 * Login credentials
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * Register credentials
 */
export interface IRegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

/**
 * Authentication response
 */
export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken?: string;
}

/**
 * Authentication state
 */
export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
