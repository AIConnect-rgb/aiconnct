import { Injectable, signal, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  isSupported = signal(false);
  isSpeaking = signal(false);
  isPaused = signal(false);
  speakingElementId = signal<string | null>(null);

  constructor(private zone: NgZone) {
    if ('speechSynthesis' in window) {
      this.isSupported.set(true);
      this.synth = window.speechSynthesis;
      // Voices are loaded asynchronously.
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      // Workaround for a browser bug where speech synthesis can become unresponsive.
      // This periodically "pings" the engine to keep it from idling into a broken state.
      setInterval(() => {
        if (this.synth && !this.isSpeaking() && !this.isPaused()) {
          this.synth.pause();
          this.synth.resume();
        }
      }, 14000);
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  speak(text: string, elementId: string, lang: string) {
    if (!this.isSupported()) {
      return;
    }

    // If speaking something else, cancel it before starting a new one.
    if ((this.isSpeaking() || this.isPaused()) && this.speakingElementId() !== elementId) {
      this.cancel();
    }
    
    this.speakingElementId.set(elementId);

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = lang;

    // Find a suitable voice.
    if (this.voices.length > 0) {
        let selectedVoice = this.voices.find(voice => voice.lang === lang);
        if (!selectedVoice) {
            // Fallback to matching just the language part (e.g., 'en' for 'en-US')
            const langPrefix = lang.split('-')[0];
            selectedVoice = this.voices.find(voice => voice.lang.startsWith(langPrefix));
        }
        if (selectedVoice) {
            this.utterance.voice = selectedVoice;
        }
    }

    this.utterance.onstart = () => {
      this.zone.run(() => {
        this.isSpeaking.set(true);
        this.isPaused.set(false);
      });
    };
    
    this.utterance.onpause = () => {
      this.zone.run(() => {
        this.isSpeaking.set(false);
        this.isPaused.set(true);
      });
    };

    this.utterance.onresume = () => {
      this.zone.run(() => {
        this.isSpeaking.set(true);
        this.isPaused.set(false);
      });
    };

    this.utterance.onend = () => {
      this.zone.run(() => {
        this.isSpeaking.set(false);
        this.isPaused.set(false);
        this.speakingElementId.set(null);
        this.utterance = null;
      });
    };
    
    // A bug can leave the synth paused from the keep-alive. Resume it to be safe.
    if (this.synth.paused) {
      this.synth.resume();
    }
    this.synth.speak(this.utterance);
  }

  pause() {
    if (this.isSpeaking()) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.isPaused()) {
      this.synth.resume();
    }
  }

  cancel() {
    if (this.isSpeaking() || this.isPaused()) {
      this.synth.cancel(); // This will trigger the 'onend' event
    }
  }
}