import { AUTH_ROUTES } from './auth.routes';

describe('AUTH_ROUTES', () => {
  it('should be defined', () => {
    expect(AUTH_ROUTES).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(AUTH_ROUTES)).toBe(true);
  });

  it('should contain login route', () => {
    const loginRoute = AUTH_ROUTES.find((r) => r.path === 'login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.loadComponent).toBeDefined();
  });

  it('should contain register route', () => {
    const registerRoute = AUTH_ROUTES.find((r) => r.path === 'register');
    expect(registerRoute).toBeDefined();
    expect(registerRoute?.loadComponent).toBeDefined();
  });

  it('should contain a default redirect to login', () => {
    const defaultRoute = AUTH_ROUTES.find((r) => r.path === '' && r.redirectTo === 'login');
    expect(defaultRoute).toBeDefined();
  });
});
