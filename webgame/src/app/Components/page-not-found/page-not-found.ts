import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: false,
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss'
})
export class PageNotFound {
  constructor(private router: Router) { }
  
  goHome() {
    this.router.navigate(['/']);
  }
}
