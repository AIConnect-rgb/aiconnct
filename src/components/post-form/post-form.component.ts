import { Component, ChangeDetectionStrategy, input, output, signal, inject, effect, untracked } from '@angular/core';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { GeminiService } from '../../services/gemini.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFormComponent {
  isPosting = input.required<boolean>();
  isAuthenticated = input.required<boolean>();
  postSubmit = output<string>();

  userInput = signal('');
  
  speechService = inject(SpeechRecognitionService);
  languageService = inject(LanguageService);
  geminiService = inject(GeminiService);
  authService = inject(AuthService);

  isRecording = this.speechService.isRecording;
  isCorrecting = signal(false);

  t = (key: string) => this.languageService.translate(key);

  constructor() {
    effect(() => {
      const transcript = this.speechService.transcript();
      untracked(() => {
        this.userInput.set(this.userInput() + transcript);
      });
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.userInput.set(target.value);
  }
  
  submitPost() {
    if (this.userInput().trim() && !this.isPosting()) {
      this.postSubmit.emit(this.userInput());
      this.userInput.set('');
    }
  }

  toggleRecording() {
    if (this.isRecording()) {
      this.speechService.stop();
    } else {
      const lang = this.languageService.currentLang();
      const speechLang = lang === 'te' ? 'te-IN' : 'en-US';
      this.speechService.start(speechLang);
    }
  }

  async runSpellCheck() {
    const currentText = this.userInput().trim();
    if (!currentText || this.isCorrecting()) {
      return;
    }

    this.isCorrecting.set(true);
    try {
      const correctedText = await this.geminiService.correctText(currentText, this.languageService.currentLang());
      this.userInput.set(correctedText);
    } catch (error) {
      console.error('Spell check failed', error);
      // The service returns the original text on error, so no UI feedback is needed here.
    } finally {
      this.isCorrecting.set(false);
    }
  }

  requestLogin() {
    this.authService.setAuthAction('signin');
  }
}