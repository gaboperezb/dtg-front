import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/app.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule), canActivate: [AuthGuard] },
  { path: 'signup-unique', loadChildren: () => import('./signup-unique/signup-unique.module').then(m => m.SignupUniquePageModule) },
  { path: 'signup-global', loadChildren: () => import('./signup-global/signup-global.module').then(m => m.SignupGlobalPageModule)},
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
