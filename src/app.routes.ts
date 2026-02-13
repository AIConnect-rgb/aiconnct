import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { FeedComponent } from './components/feed/feed.component';
import { SettingsComponent } from './components/settings/settings.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard';
import { AuthPageComponent } from './components/auth-page/auth-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthPageComponent,
    canActivate: [loginGuard]
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: FeedComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
