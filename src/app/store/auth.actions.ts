import { IUser } from 'coffee-shared-lib';
import { createAction, props } from '@ngrx/store';
import { ILoginCredentials, IRegisterCredentials, IAuthResponse } from '../models/auth.model';

// ─── Login ────────────────────────────────────────────────────────────────────

export const authLogin = createAction(
  '[Auth MFE] Login',
  props<{ credentials: ILoginCredentials }>(),
);

export const authLoginSuccess = createAction(
  '[Auth MFE] Login Success',
  props<{ response: IAuthResponse }>(),
);

export const authLoginFailure = createAction(
  '[Auth MFE] Login Failure',
  props<{ error: string }>(),
);

// ─── Register ─────────────────────────────────────────────────────────────────

export const authRegister = createAction(
  '[Auth MFE] Register',
  props<{ credentials: IRegisterCredentials }>(),
);

export const authRegisterSuccess = createAction(
  '[Auth MFE] Register Success',
  props<{ response: IAuthResponse }>(),
);

export const authRegisterFailure = createAction(
  '[Auth MFE] Register Failure',
  props<{ error: string }>(),
);

// ─── Logout ───────────────────────────────────────────────────────────────────

export const authLogout = createAction('[Auth MFE] Logout');

export const authLogoutSuccess = createAction('[Auth MFE] Logout Success');

export const authLogoutFailure = createAction(
  '[Auth MFE] Logout Failure',
  props<{ error: string }>(),
);

// ─── Update Token ─────────────────────────────────────────────────────────────

export const authUpdateToken = createAction(
  '[Auth MFE] Update Token',
  props<{ token: string; refreshToken?: string }>(),
);

// ─── Hydrate from storage ─────────────────────────────────────────────────────

export const authHydrate = createAction('[Auth MFE] Hydrate From Storage');

export const authHydrateSuccess = createAction(
  '[Auth MFE] Hydrate From Storage Success',
  props<{ token: string | null; refreshToken: string | null; user: IUser | null }>(),
);

// ─── Clear error ──────────────────────────────────────────────────────────────

export const authClearError = createAction('[Auth MFE] Clear Error');
