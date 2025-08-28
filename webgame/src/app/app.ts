import { Component, signal, OnInit, Inject, ElementRef, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';  // 🔹 Firebase auth
import { ChangeDetectorRef } from '@angular/core';

interface AccentOption {
  name: string;
  val: 'blueGradient' | 'pinkGradient' | 'mintGradient' | 'sunsetGradient' | 'blackGradient';
}

type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('rockPaperScissor-app');

  hamburgerOpen = false;
  disableSelection = true;

  theme: ThemeMode = 'system'; // default
  accent: AccentOption['val'] = 'blackGradient';

  showHeader = true;
  showSettings = false;

  toggleHamburger() {
    this.hamburgerOpen = !this.hamburgerOpen;
  }

  accents: AccentOption[] = [
    { name: 'Black', val: 'blackGradient' },
    { name: 'Blue', val: 'blueGradient' },
    { name: 'Pink', val: 'pinkGradient' },
    { name: 'Mint', val: 'mintGradient' },
    { name: 'Sunset', val: 'sunsetGradient' },
  ];

  accountMenuOpen = false;

  openSettings() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elRef: ElementRef,
    public router: Router,
    private afAuth: AngularFireAuth,
    private cdr: ChangeDetectorRef,
  ) {
    // hide header for specific routes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeader = !['/login', '/game'].includes(event.urlAfterRedirects);
      });
  }

  ngOnInit() {
    // 🔹 restore saved theme/accent/label
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedAccent = localStorage.getItem('accent') as AccentOption['val'] | null;
    const savedLabel = localStorage.getItem('accountLabel');

    if (savedTheme) this.theme = savedTheme;
    if (savedAccent) this.accent = savedAccent;
    if (savedLabel) this._accountLabel = savedLabel;  // restore instantly

    this.applyTheme();
    this.setAccent(this.accent);

    // 🔹 listen to Firebase auth changes
    this.afAuth.authState.subscribe(user => {
      this.loggedIn = !!user;
      if (user) {
        this.userDisplayName = user.displayName || user.email || 'My Account';
        this._accountLabel = this.userDisplayName.split(' ')[0]; // only first name
      } else {
        this.userDisplayName = null;
        this._accountLabel = 'Login';
      }
      this.cdr.detectChanges();
      localStorage.setItem('accountLabel', this._accountLabel); // persist
    });
  }

  /** Cycle through Light → Dark → System */
  toggleTheme() {
    if (this.theme === 'system') {
      this.theme = 'dark';
    } else if (this.theme === 'dark') {
      this.theme = 'light';
    } else {
      this.theme = 'system';
    }
    localStorage.setItem('theme', this.theme); // 🔹 persist
    this.applyTheme();
  }

  private applyTheme() {
    this.document.body.classList.remove('dark-theme-override', 'light-theme-override');

    if (this.theme === 'dark') {
      this.document.body.classList.add('dark-theme-override');
    } else if (this.theme === 'light') {
      this.document.body.classList.add('light-theme-override');
    }
  }

  setAccent(value: AccentOption['val']) {
    this.accents.forEach(a => {
      this.document.body.classList.remove(a.val);
    });
    this.document.body.classList.add(value);
    this.accent = value;
    localStorage.setItem('accent', value); // 🔹 persist
  }

  loggedIn = false;
  userDisplayName: string | null = null;

  /** Internal label storage */
  private _accountLabel: string = 'Login';
  get accountLabel(): string {
    return this._accountLabel;
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/home']);
  }

  toggleAccountMenu() {
    if (!this.loggedIn) {
      // not logged in → go to login page
      this.router.navigate(['/login']);
      return;
    }
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  /** Close menu on outside click */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const myAccountEl = this.elRef.nativeElement.querySelector('.myAccount');
    if (this.accountMenuOpen && myAccountEl && !myAccountEl.contains(event.target)) {
      this.accountMenuOpen = false;
    }
  }
}
