import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

interface AccentOption {
  name: string;
  val: 'blueGradient' | 'pinkGradient' | 'mintGradient' | 'sunsetGradient' | 'blackGradient';
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  isLoginMode = true;
  errorMessage: string | null = null; // 🔹 for showing error in UI

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null;
  }

  accent: AccentOption['val'] = 'blackGradient';

  accents: AccentOption[] = [
    { name: 'Black', val: 'blackGradient' },
    { name: 'Blue', val: 'blueGradient' },
    { name: 'Pink', val: 'pinkGradient' },
    { name: 'Mint', val: 'mintGradient' },
    { name: 'Sunset', val: 'sunsetGradient' },
  ];

  async onSubmit(formData: { email: string; password: string; username?: string }) {
    try {
      if (this.isLoginMode) {
        // 🔹 Login
        const result = await this.afAuth.signInWithEmailAndPassword(
          formData.email,
          formData.password
        );
        console.log('Login success ✅', result.user);
        this.errorMessage = null;

        // 🔹 Navigate to homepage
        this.router.navigate(['/home']);

      } else {
        // 🔹 Signup
        const result = await this.afAuth.createUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        console.log('Signup success ✅', result.user);

        // optional: set username
        if (formData.username && result.user) {
          await result.user.updateProfile({ displayName: formData.username });
        }

        this.errorMessage = null;

        // 🔹 Navigate to homepage after signup
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('Auth Error ❌', error);
      this.errorMessage = error.message || 'Something went wrong!';
    }
  }
}
