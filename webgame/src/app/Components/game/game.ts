import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.html',
  styleUrls: ['./game.scss']
})
export class Game implements OnInit {
  player1: string = 'Guest';
  player2: string = 'Computer';
  score = { wins: 0, losses: 0, ties: 0 };
  result = '';
  playerMoveImg = '../../../assets/heart-emoji.png';
  computerMoveImg = '../../../assets/heart-emoji.png';

  constructor(private router: Router) {}

  ngOnInit() {
    // Try to get player names from router state
    const navState = this.router.getCurrentNavigation()?.extras.state as any;
    if (navState?.player1) {
      this.player1 = navState.player1;
      this.player2 = navState.player2 || 'Computer';

      // Save to sessionStorage for persistence on refresh
      sessionStorage.setItem('player1', this.player1);
      sessionStorage.setItem('player2', this.player2);
    } else {
      // Fallback: retrieve from sessionStorage
      this.player1 = sessionStorage.getItem('player1') || 'Guest';
      this.player2 = sessionStorage.getItem('player2') || 'Computer';
    }

    // Restore previous score
    const savedScore = localStorage.getItem('game_score');
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
  }

  play(playerMove: 'rock' | 'paper' | 'scissor') {
    const computerMove = this.getComputerMove();

    if (playerMove === computerMove) {
      this.result = "It's a tie!";
      this.score.ties++;
    } else if (
      (playerMove === 'rock' && computerMove === 'scissor') ||
      (playerMove === 'paper' && computerMove === 'rock') ||
      (playerMove === 'scissor' && computerMove === 'paper')
    ) {
      this.result = 'You win!';
      this.score.wins++;
    } else {
      this.result = 'You lose!';
      this.score.losses++;
    }

    // Save score
    localStorage.setItem('game_score', JSON.stringify(this.score));

    // Update move images
    this.playerMoveImg = `../../../assets/${playerMove}-emoji.png`;
    this.computerMoveImg = `../../../assets/${computerMove}-emoji.png`;
  }

  getComputerMove(): 'rock' | 'paper' | 'scissor' {
    const rand = Math.random();
    if (rand < 1 / 3) return 'rock';
    if (rand < 2 / 3) return 'paper';
    return 'scissor';
  }

  resetScore() {
    this.score = { wins: 0, losses: 0, ties: 0 };
    localStorage.removeItem('game_score');
  }
}
