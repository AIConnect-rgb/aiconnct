import { Component, ChangeDetectionStrategy, signal, inject, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostFormComponent } from '../post-form/post-form.component';
import { PostComponent } from '../post/post.component';
import { GeminiService } from '../../services/gemini.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostFormComponent, PostComponent],
  templateUrl: './feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {
  private geminiService = inject(GeminiService);
  authService = inject(AuthService);
  languageService = inject(LanguageService);

  isAuthenticated = this.authService.isAuthenticated;
  error = signal<string | null>(null);

  errorDetails = computed(() => {
    const err = this.error();
    if (!err) return null;

    if (err.includes('API configuration')) {
        return {
            title: this.t('apiErrorTitle'),
            message: this.t('apiErrorMessage'),
        };
    }
    if (err.includes('safety settings')) {
        return {
            title: this.t('safetyErrorTitle'),
            message: this.t('safetyErrorMessage'),
        };
    }
    if (err.includes('connect to the AI service')) {
        return {
            title: this.t('connectionErrorTitle'),
            message: this.t('connectionErrorMessage'),
        };
    }
    if (err.includes('empty response')) {
        return {
            title: this.t('emptyResponseErrorTitle'),
            message: this.t('emptyResponseErrorMessage'),
        };
    }
    if (err.includes('not in the expected format')) {
        return {
            title: this.t('formatErrorTitle'),
            message: this.t('formatErrorMessage'),
        };
    }
    
    return {
        title: this.t('unexpectedErrorTitle'),
        message: this.t('unexpectedErrorMessage'),
    };
  });

  isPosting = signal(false);
  posts = signal<Post[]>([]);
  
  t = (key: string) => this.languageService.translate(key);

  constructor() {
    // This effect creates and updates the sample post whenever the language changes.
    effect(() => {
      this.languageService.currentLang(); // Establish dependency on the current language.
      
      const samplePost: Post = {
        id: '1',
        author: this.t('aiEnthusiast'),
        handle: this.t('aiDevHandle'),
        avatarUrl: 'https://i.pravatar.cc/48?u=1',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        text: this.t('samplePostText'),
        analysis: {
          summary_metrics: {
            total_processed: 1,
            high_value_ideas_count: 1,
            predominant_sentiment: 'Supportive',
          },
          top_insights: [
            {
              user_id: 'user_001',
              original_comment: '...',
              summary: this.t('samplePostSummary'),
              innovation_score: 9,
              ip_flag: true,
            },
          ],
          automated_response_sample: this.t('samplePostResponse'),
          lang: 'en',
        },
        isAnalyzing: false,
      };

      untracked(() => {
        this.posts.update(currentPosts => {
          const userPosts = currentPosts.filter(p => p.id !== '1');
          return [samplePost, ...userPosts];
        });
      });
    });
  }

  async handleNewPost(postText: string) {
    if (!postText.trim() || this.isPosting()) return;

    this.isPosting.set(true);
    this.error.set(null);

    const tempId = `temp_${Date.now()}`;
    const newPostPlaceholder: Post = {
      id: tempId,
      author: this.t('you'),
      handle: this.t('userHandle'),
      avatarUrl: 'https://i.pravatar.cc/48?u=current_user',
      timestamp: new Date(),
      text: postText,
      analysis: null,
      isAnalyzing: true,
    };

    this.posts.update(currentPosts => [newPostPlaceholder, ...currentPosts]);

    try {
      const result = await this.geminiService.analyzeContent(postText);
      const finalPost: Post = { ...newPostPlaceholder, id: `post_${Date.now()}`, analysis: result, isAnalyzing: false };
      this.posts.update(currentPosts => currentPosts.map(p => (p.id === tempId ? finalPost : p)));
    } catch (e: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      this.error.set(errorMessage);
      this.posts.update(currentPosts => currentPosts.filter(p => p.id !== tempId));
    } finally {
      this.isPosting.set(false);
    }
  }
}