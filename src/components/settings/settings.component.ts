import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  languageService = inject(LanguageService);
  t = (key: string) => this.languageService.translate(key);

  displayName = signal(this.t('you'));
  handle = signal(this.t('userHandle'));
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  saveChanges() {
    if (this.saveStatus() === 'saving') return;

    this.saveStatus.set('saving');
    console.log('Saving changes:', { 
      displayName: this.displayName(),
      handle: this.handle() 
    });
    
    // In a real app, this would be an API call.
    // We'll simulate it with a timeout.
    setTimeout(() => {
      this.saveStatus.set('saved');
      // Reset the button state after showing the saved message
      setTimeout(() => this.saveStatus.set('idle'), 2000);
    }, 1000);
  }
}