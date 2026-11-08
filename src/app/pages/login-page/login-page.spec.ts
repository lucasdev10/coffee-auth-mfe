import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginPageComponent } from './login-page';
import { AuthFacade } from '../../store';
import { initialAuthState } from '../../store/auth.state';

// ─── Mock AuthFacade ─────────────────────────────────────────────────────────

const errorSubject = new BehaviorSubject<string | null>(null);
const loadingSubject = new BehaviorSubject<boolean>(false);

const mockAuthFacade = {
  get isLoading$() { return loadingSubject.asObservable(); },
  get error$() { return errorSubject.asObservable(); },
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    errorSubject.next(null);
    loadingSubject.next(false);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, RouterTestingModule],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ initialState: { auth: initialAuthState } }),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Component creation ───────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose isLoading$ and error$ from AuthFacade', () => {
    expect(component.isLoading$).toBeDefined();
    expect(component.error$).toBeDefined();
  });

  it('should initialize hidePassword as true', () => {
    expect(component.hidePassword()).toBe(true);
  });

  // ─── Form structure ───────────────────────────────────────────────────────

  it('should have an email field in the login form', () => {
    expect(component.loginForm.email).toBeDefined();
  });

  it('should have a password field in the login form', () => {
    expect(component.loginForm.password).toBeDefined();
  });

  it('should start with invalid form (empty fields)', () => {
    expect(component.loginForm().invalid()).toBe(true);
  });

  // ─── Form validation ──────────────────────────────────────────────────────

  it('should be invalid with empty email', () => {
    component.loginForm().value.set({ email: '', password: 'password123' });
    expect(component.loginForm().invalid()).toBe(true);
  });

  it('should be invalid with invalid email format', () => {
    component.loginForm().value.set({ email: 'not-an-email', password: 'password123' });
    expect(component.loginForm().invalid()).toBe(true);
  });

  it('should be invalid with password shorter than 6 characters', () => {
    component.loginForm().value.set({ email: 'user@test.com', password: 'abc' });
    expect(component.loginForm().invalid()).toBe(true);
  });

  it('should be valid with correct email and password', () => {
    component.loginForm().value.set({ email: 'user@test.com', password: 'password123' });
    expect(component.loginForm().valid()).toBe(true);
  });

  // ─── Submit behavior ──────────────────────────────────────────────────────

  it('should NOT call authFacade.login when form is invalid', () => {
    component.onSubmit();
    expect(mockAuthFacade.login).not.toHaveBeenCalled();
  });

  it('should mark form as touched when submitting invalid form', () => {
    const markAsTouchedSpy = vi.spyOn(component.loginForm(), 'markAsTouched');
    component.onSubmit();
    expect(markAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call authFacade.login with credentials when form is valid', () => {
    component.loginForm().value.set({ email: 'user@test.com', password: 'password123' });
    component.onSubmit();
    expect(mockAuthFacade.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });
  });

  it('should call authFacade.login exactly once per valid submit', () => {
    component.loginForm().value.set({ email: 'user@test.com', password: 'securepass' });
    component.onSubmit();
    expect(mockAuthFacade.login).toHaveBeenCalledTimes(1);
  });

  // ─── Password visibility toggle ───────────────────────────────────────────

  it('should toggle hidePassword from true to false', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
  });

  it('should toggle hidePassword back to true on second call', () => {
    component.togglePasswordVisibility();
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  // ─── Error display ────────────────────────────────────────────────────────

  it('should expose error$ that emits null when no error', async () => {
    const error = await new Promise<string | null>((resolve) => {
      component.error$.subscribe((e) => resolve(e));
    });
    expect(error).toBeNull();
  });

  it('should expose error$ that emits error message when auth fails', async () => {
    errorSubject.next('Invalid credentials');

    const error = await new Promise<string | null>((resolve) => {
      component.error$.subscribe((e) => resolve(e));
    });
    expect(error).toBe('Invalid credentials');
  });
});
