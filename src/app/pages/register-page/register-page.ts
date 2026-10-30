import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FormErrorComponent } from 'coffee-shared-lib';
import { firstValueFrom } from 'rxjs';
import { AuthFacade } from '../../store';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormErrorComponent,
    FormField,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RegisterPageComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly isLoading$ = this.authFacade.isLoading$;
  readonly error$ = this.authFacade.error$;
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  readonly registerForm = form(
    signal({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }),
    (fieldPath) => {
      required(fieldPath.fullName, { message: 'Field required' });
      minLength(fieldPath.fullName, 2, { message: 'Minimum of 2 characters' });
      required(fieldPath.email, { message: 'Field required' });
      email(fieldPath.email, { message: 'Invalid email address' });
      required(fieldPath.password, { message: 'Field required' });
      minLength(fieldPath.password, 6, { message: 'Minimum of 6 characters' });
      required(fieldPath.confirmPassword, { message: 'Field required' });
    },
  );

  readonly canSubmit = computed(
    async () => this.registerForm().valid() && !(await firstValueFrom(this.isLoading$)),
  );

  onSubmit(): void {
    if (this.registerForm().invalid()) {
      this.registerForm().markAsTouched();
      return;
    }

    const { confirmPassword, ...values } = this.registerForm().value();

    if (values.password !== confirmPassword) {
      return;
    }

    this.authFacade.register({ ...values, confirmPassword });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }
}
