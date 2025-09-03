import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import LightBlueTheme from '../app/shared/blueTheme';

// Angular Common/Router
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';

// Angular/Bootstrap Modules
import { NgbModule, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// PrimeNG UI Modules
import { TextareaModule } from 'primeng/textarea';
import { InputMaskModule } from 'primeng/inputmask';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { InputOtpModule } from 'primeng/inputotp';

// PrimeNG Services
import { MessageService } from 'primeng/api';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

// App Components
import { Game } from './Components/game/game';
import { LoginComponent } from './Components/login/login';
import { Homepage } from './Components/homepage/homepage';
import { Supportus } from './Components/supportus/supportus';
import { Features } from './Components/features/features';
import { Aboutus } from './Components/aboutus/aboutus';
import { Privacy } from './Components/privacy/privacy';
import { TermsAndConditions } from './Components/terms-and-conditions/terms-and-conditions';
import { PageNotFound } from './Components/page-not-found/page-not-found';
import { PlayWithFriendGame } from './Components/play-with-friend-game/play-with-friend-game';

@NgModule({
  declarations: [
    App,              // must declare root component
    Game,
    LoginComponent,
    Homepage,
    Features,
    Supportus,
    Aboutus,
    Privacy,
    TermsAndConditions,
    PageNotFound,
    PlayWithFriendGame
  ],
  imports: [
    BrowserModule,
    CommonModule,     //  Fix for ngIf, ngFor, ngClass
    RouterModule,     //  Fix for routerLink
    AppRoutingModule,
    BrowserAnimationsModule,

    // PrimeNG
    AccordionModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    SkeletonModule,
    TextareaModule,
    InputMaskModule,
    RatingModule,
    SliderModule,
    TabsModule,
    PaginatorModule,
    InputNumberModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    InputOtpModule,

    // Bootstrap
    NgbModule,
    NgbCarouselModule,

    // Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    providePrimeNG({
      theme: {
        preset: LightBlueTheme
      }
    }),
    MessageService,
  ],
  bootstrap: [App]
})
export class AppModule { }
