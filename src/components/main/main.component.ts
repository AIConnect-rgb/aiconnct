import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;

  t = (key: string) => this.languageService.translate(key);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changeLanguage(event: Event) {
    const lang = (event.target as HTMLSelectElement).value as SupportedLanguage;
    this.languageService.setLanguage(lang);
  }
}
