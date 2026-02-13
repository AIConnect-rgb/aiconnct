import { Component, ChangeDetectionStrategy, input, inject, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { ChatMessage } from '../../models/post.model';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { GeminiService } from '../../services/gemini.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComponent {
  post = input.required<Post>();
  isAuthenticated = input.required<boolean>();
  ttsService = inject(TextToSpeechService);
  geminiService = inject(GeminiService);
  languageService = inject(LanguageService);
  authService = inject(AuthService);

  @ViewChild('chatInputEl') chatInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('chatInputContainer') chatInputContainer!: ElementRef<HTMLDivElement>;
  private speakingElementId = this.ttsService.speakingElementId;

  chatHistory = signal<ChatMessage[]>([]);
  chatInputText = signal('');
  isReplying = signal(false);
  isChatVisible = signal(false);
  isCopied = signal(false);
  replyingTo = signal<ChatMessage | null>(null);

  t = (key: string) => this.languageService.translate(key);

  isAnythingSpeakingOnThisPost = computed(() => this.speakingElementId()?.startsWith(this.post().id));
  isCommentSpeaking = computed(() => this.speakingElementId() === this.post().id + '-comment' && this.ttsService.isSpeaking());
  isCommentPaused = computed(() => this.speakingElementId() === this.post().id + '-comment' && this.ttsService.isPaused());
  
  isMessageSpeaking = (id: string) => computed(() => this.speakingElementId() === id && this.ttsService.isSpeaking());
  isMessagePaused = (id: string) => computed(() => this.speakingElementId() === id && this.ttsService.isPaused());

  constructor() {
    effect(() => {
        const post = this.post();
        if (post.analysis && this.chatHistory().length === 0) {
            this.chatHistory.set([{
                id: `${post.id}-chat-0`,
                author: 'ai',
                text: post.analysis.automated_response_sample,
                replyingToText: post.text
            }]);
        }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 8) return 'bg-teal-500/20 text-teal-300';
    if (score >= 5) return 'bg-sky-500/20 text-sky-300';
    return 'bg-amber-500/20 text-amber-300';
  }

  toggleReadComment() {
    const elementId = this.post().id + '-comment';
    if (this.isCommentSpeaking()) {
      this.ttsService.pause();
      return;
    }
    if (this.isCommentPaused()) {
      this.ttsService.resume();
      return;
    }
    const text = this.post().text;
    const langCode = this.post().analysis?.lang || 'en';
    const speechLang = langCode === 'te' ? 'te-IN' : 'en-US';
    this.ttsService.speak(text, elementId, speechLang);
  }

  toggleReadMessage(message: ChatMessage) {
    if (this.isMessageSpeaking(message.id)()) {
      this.ttsService.pause();
      return;
    }
    if (this.isMessagePaused(message.id)()) {
      this.ttsService.resume();
      return;
    }
    const langCode = this.post().analysis?.lang || 'en';
    const speechLang = langCode === 'te' ? 'te-IN' : 'en-US';
    this.ttsService.speak(message.text, message.id, speechLang);
  }

  toggleChatVisibility() {
    this.isChatVisible.update(v => !v);
  }

  sharePost() {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return;
    }
    navigator.clipboard.writeText(this.post().text).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  replyToMessage(message: ChatMessage) {
    this.replyingTo.set(message);
    this.chatInputContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.chatInput?.nativeElement.focus();
  }

  cancelReply() {
    this.replyingTo.set(null);
  }

  requestLogin() {
    this.authService.setAuthAction('signin');
  }

  async sendChatMessage() {
    const text = this.chatInputText().trim();
    if (!text || this.isReplying() || !this.post().analysis) return;

    this.isReplying.set(true);
    const initialAiMessage = this.post().analysis!.automated_response_sample;
    const messageBeingRepliedTo = this.replyingTo();

    const userMessage: ChatMessage = { 
        id: `${this.post().id}-chat-${this.chatHistory().length}`, 
        author: 'user', 
        text: text,
        replyingToText: messageBeingRepliedTo?.text
    };
    this.chatHistory.update(history => [...history, userMessage]);
    
    this.chatInputText.set('');
    this.replyingTo.set(null);

    try {
        // Pass the raw user text. The GeminiService manages the chat session and its history.
        const response = await this.geminiService.sendMessage(this.post().id, text, initialAiMessage);
        const aiMessage: ChatMessage = { 
          id: `${this.post().id}-chat-${this.chatHistory().length}`, 
          author: 'ai', 
          text: response.text,
          replyingToText: userMessage.text 
        };
        this.chatHistory.update(history => [...history, aiMessage]);
    } catch (e) {
        console.error("Chat error:", e);
        const errorMessage: ChatMessage = { id: `${this.post().id}-chat-${this.chatHistory().length}`, author: 'ai', text: this.t('chatError') };
        this.chatHistory.update(history => [...history, errorMessage]);
    } finally {
        this.isReplying.set(false);
    }
  }
}