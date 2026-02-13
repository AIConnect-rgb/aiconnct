import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthAction } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  authAction = this.authService.authAction;

  t = (key: string) => this.languageService.translate(key);

  constructor() {
    effect(() => {
      // This effect will re-run if the language changes,
      // ensuring the error message is always in the correct language.
      this.languageService.currentLang();
      if (this.error()) {
        this.error.set(this.t('invalidCredentialsError'));
      }
    });
  }

  submitAuthForm() {
    this.error.set(null);
    let success = false;
    if (this.authAction() === 'signin') {
      success = this.authService.login(this.email(), this.password());
    } else {
      success = this.authService.signup(this.email(), this.password());
    }
    if (!success) {
      this.error.set(this.t('invalidCredentialsError'));
    } else {
      this.router.navigate(['/']);
    }
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
    this.router.navigate(['/']);
  }

  setAuthAction(action: AuthAction) {
    this.authService.setAuthAction(action);
    this.error.set(null);
    this.email.set('');
    this.password.set('');
  }
}
