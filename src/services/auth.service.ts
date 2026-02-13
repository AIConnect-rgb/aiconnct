import { Injectable, signal } from '@angular/core';

export type AuthAction = 'signin' | 'signup';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);
  authAction = signal<AuthAction>('signin');

  setAuthAction(action: AuthAction) {
    this.authAction.set(action);
  }

  // In a real app, this would involve API calls, token validation, etc.
  // For this demo, we'll simulate a login.
  login(user: string, pass: string): boolean {
    // Mock login logic
    if (user && pass) {
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }
  
  signup(user: string, pass: string): boolean {
    // Mock signup logic
    if (user && pass) {
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  // Simulate Google login
  loginWithGoogle(): void {
    console.log('Redirecting to Google for authentication...');
    this.isAuthenticated.set(true);
  }

  logout(): void {
    this.isAuthenticated.set(false);
  }
}