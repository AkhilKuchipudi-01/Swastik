import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Homepage } from './Components/homepage/homepage';
import { LoginComponent } from './Components/login/login';
import { Game } from './Components/game/game';
import { Supportus } from './Components/supportus/supportus';
import { Features } from './Components/features/features';
import { Aboutus } from './Components/aboutus/aboutus';
import { Privacy } from './Components/privacy/privacy';
import { TermsAndConditions } from './Components/terms-and-conditions/terms-and-conditions';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',   // fixed
    pathMatch: 'full'
  },
  {
    path: 'game',
    component: Game,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: Homepage,
  },
  {
    path: 'aboutus',
    component: Aboutus,
  },
  {
    path: 'features',
    component: Features,
  },
  {
    path: 'supportus',
    component: Supportus,
  },
  {
    path: 'privacy',
    component: Privacy,
  },
  {
    path: 'terms',
    component: TermsAndConditions,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
