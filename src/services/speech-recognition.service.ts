import { Injectable, signal, NgZone } from '@angular/core';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: any | null = null;
  
  isSupported = signal<boolean>(false);
  isRecording = signal<boolean>(false);
  transcript = signal<string>('');
  error = signal<string>('');

  constructor(private zone: NgZone) {
    if ('webkitSpeechRecognition' in window) {
      this.isSupported.set(true);
      this.recognition = new window.webkitSpeechRecognition();

      this.recognition.onresult = (event: any) => {
        this.zone.run(() => {
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          // We only want the final part to be added, not the interim.
          // The final transcript is emitted when the user pauses.
          this.transcript.set(finalTranscript);
        });
      };

      this.recognition.onerror = (event: any) => {
        this.zone.run(() => {
          this.error.set('Speech recognition error: ' + event.error);
          this.isRecording.set(false);
        });
      };
      
       this.recognition.onend = () => {
        this.zone.run(() => {
            this.isRecording.set(false);
        });
      };

    } else {
      this.isSupported.set(false);
    }
  }

  start(lang: string = 'en-US'): void {
    if (!this.isSupported() || this.isRecording()) {
      return;
    }
    this.transcript.set('');
    this.error.set('');
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.start();
    this.isRecording.set(true);
  }

  stop(): void {
    if (!this.isSupported() || !this.isRecording()) {
      return;
    }
    this.recognition.stop();
    this.isRecording.set(false);
  }
}