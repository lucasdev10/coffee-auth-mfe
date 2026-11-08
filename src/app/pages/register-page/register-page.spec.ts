import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RegisterPageComponent } from './register-page';
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

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    errorSubject.next(null);
    loadingSubject.next(false);

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent, RouterTestingModule],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ initialState: { auth: initialAuthState } }),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
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

  it('should initialize hideConfirmPassword as true', () => {
    expect(component.hideConfirmPassword()).toBe(true);
  });

  // ─── Form structure ───────────────────────────────────────────────────────

  it('should have a fullName field in the register form', () => {
    expect(component.registerForm.fullName).toBeDefined();
  });

  it('should have an email field in the register form', () => {
    expect(component.registerForm.email).toBeDefined();
  });

  it('should have a password field in the register form', () => {
    expect(component.registerForm.password).toBeDefined();
  });

  it('should have a confirmPassword field in the register form', () => {
    expect(component.registerForm.confirmPassword).toBeDefined();
  });

  it('should start with invalid form (empty fields)', () => {
    expect(component.registerForm().invalid()).toBe(true);
  });

  // ─── Form validation ──────────────────────────────────────────────────────

  it('should be invalid with empty full name', () => {
    component.registerForm().value.set({ fullName: '', email: 'user@test.com', password: 'password123', confirmPassword: 'password123' });
    expect(component.registerForm().invalid()).toBe(true);
  });

  it('should be invalid with full name shorter than 2 characters', () => {
    component.registerForm().value.set({ fullName: 'A', email: 'user@test.com', password: 'password123', confirmPassword: 'password123' });
    expect(component.registerForm().invalid()).toBe(true);
  });

  it('should be invalid with invalid email format', () => {
    component.registerForm().value.set({ fullName: 'Test User', email: 'not-an-email', password: 'password123', confirmPassword: 'password123' });
    expect(component.registerForm().invalid()).toBe(true);
  });

  it('should be invalid with password shorter than 6 characters', () => {
    component.registerForm().value.set({ fullName: 'Test User', email: 'user@test.com', password: 'abc', confirmPassword: 'abc' });
    expect(component.registerForm().invalid()).toBe(true);
  });

  it('should be valid with all fields correctly filled', () => {
    component.registerForm().value.set({ fullName: 'Test User', email: 'user@test.com', password: 'password123', confirmPassword: 'password123' });
    expect(component.registerForm().valid()).toBe(true);
  });

  // ─── Submit behavior ──────────────────────────────────────────────────────

  it('should NOT call authFacade.register when form is invalid', () => {
    // Form is empty (invalid) by default
    component.onSubmit();
    expect(mockAuthFacade.register).not.toHaveBeenCalled();
  });

  it('should mark form as touched when submitting invalid form', () => {
    const markAsTouchedSpy = vi.spyOn(component.registerForm(), 'markAsTouched');
    component.onSubmit();
    expect(markAsTouchedSpy).toHaveBeenCalled();
  });

  it('should NOT call authFacade.register when passwords do not match', () => {
    component.registerForm().value.set({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'differentpass',
    });

    component.onSubmit();

    expect(mockAuthFacade.register).not.toHaveBeenCalled();
  });

  it('should call authFacade.register with credentials when form is valid and passwords match', () => {
    component.registerForm().value.set({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(mockAuthFacade.register).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
  });

  it('should call authFacade.register exactly once per valid submit', () => {
    component.registerForm().value.set({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'securepass',
      confirmPassword: 'securepass',
    });

    component.onSubmit();

    expect(mockAuthFacade.register).toHaveBeenCalledTimes(1);
  });

  // ─── Password visibility toggles ─────────────────────────────────────────

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

  it('should toggle hideConfirmPassword from true to false', () => {
    expect(component.hideConfirmPassword()).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(false);
  });

  it('should toggle hideConfirmPassword back to true on second call', () => {
    component.toggleConfirmPasswordVisibility();
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(true);
  });

  // ─── Independence of password/confirm toggles ─────────────────────────────

  it('should toggle hidePassword and hideConfirmPassword independently', () => {
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    expect(component.hideConfirmPassword()).toBe(true);

    component.toggleConfirmPasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    expect(component.hideConfirmPassword()).toBe(false);
  });

  // ─── Error display ────────────────────────────────────────────────────────

  it('should expose error$ that emits null when no error', async () => {
    const error = await new Promise<string | null>((resolve) => {
      component.error$.subscribe((e) => resolve(e));
    });
    expect(error).toBeNull();
  });
});
