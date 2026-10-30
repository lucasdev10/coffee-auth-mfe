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
  selector: 'app-login-page',
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
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoginPageComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly isLoading$ = this.authFacade.isLoading$;
  readonly error$ = this.authFacade.error$;
  readonly hidePassword = signal(true);

  readonly loginForm = form(
    signal({
      email: '',
      password: '',
    }),
    (fieldPath) => {
      required(fieldPath.email, { message: 'Field required' });
      email(fieldPath.email, { message: 'Invalid email address' });
      required(fieldPath.password, { message: 'Field required' });
      minLength(fieldPath.password, 6, { message: 'Minimum of 6 characters' });
    },
  );

  readonly canSubmit = computed(
    async () => this.loginForm().valid() && !(await firstValueFrom(this.isLoading$)),
  );

  onSubmit(): void {
    if (this.loginForm().invalid()) {
      this.loginForm().markAsTouched();
      return;
    }

    const credentials = this.loginForm().value();
    this.authFacade.login(credentials);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }
}
