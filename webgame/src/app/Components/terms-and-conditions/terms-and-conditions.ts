import { Component } from '@angular/core';

interface AccentOption {
  name: string;
  val: 'blueGradient' | 'pinkGradient' | 'mintGradient' | 'sunsetGradient' | 'blackGradient';
}

@Component({
  selector: 'app-terms-and-conditions',
  standalone: false,
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.scss'
})
export class TermsAndConditions {

  accent: AccentOption['val'] = 'blackGradient';

  accents: AccentOption[] = [
    { name: 'Black', val: 'blackGradient' },
    { name: 'Blue', val: 'blueGradient' },
    { name: 'Pink', val: 'pinkGradient' },
    { name: 'Mint', val: 'mintGradient' },
    { name: 'Sunset', val: 'sunsetGradient' },
  ];

  setAccent(value: AccentOption['val']) {
    this.accent = value;
  }
}
