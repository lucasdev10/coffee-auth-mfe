import { AUTH_ROUTES } from './auth.routes';

describe('AUTH_ROUTES', () => {
  it('should be defined', () => {
    expect(AUTH_ROUTES).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(AUTH_ROUTES)).toBe(true);
  });
});
