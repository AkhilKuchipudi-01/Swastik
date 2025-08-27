import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Realtime } from '../../shared/realtime';
import { ChangeDetectorRef } from '@angular/core';

interface AccentOption {
  name: string;
  val: 'blueGradient' | 'pinkGradient' | 'mintGradient' | 'sunsetGradient' | 'blackGradient';
}

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage implements OnInit {
  dark = true;
  openModal = false;
  message = '';
  accent: AccentOption['val'] = 'blackGradient';

  liveViewersCount = 0;
  private userId = Math.random().toString(36).substring(2, 10); // Random ID per tab
  username: string = '';

  waitingDialog = false;
  private waitTimeout: any;
  private skeletonInterval: any;

  // --- Multiplayer Dialog State ---
  friendDialog: boolean = false;
  activeTab: 'Create' | 'Join' = 'Create';

  // --- Room Management ---
  roomCode: string = '';
  joinCode: string[] = ['', '', '', ''];
  player2Joined: boolean = false;

  // constructor(private realtime: Realtime, private router: Router) { }

  /** Open dialog and default to Create tab */
  // startFriendGame() {
  //   this.friendDialog = true;
  //   this.selectTab('Create');
  //   this.generateRoomCode();
  // }

  /** Switch tab */
  selectTab(tab: 'Create' | 'Join') {
    this.activeTab = tab;
    if (tab === 'Create') {
      this.generateRoomCode();
    }
  }

  /** Generate 4-digit room code and create room */
  generateRoomCode() {
    this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    sessionStorage.setItem('roomCode', this.roomCode);

    this.realtime.createRoom(this.roomCode, this.username);

    // Listen for guest joining
    this.realtime.onPlayerJoined(this.roomCode, (guest: string) => {
      this.player2Joined = true;
    });
  }

  /** Host starts the game */
  startCreatedGame() {
    this.friendDialog = false;
    this.router.navigate(['/game'], {
      queryParams: { code: this.roomCode, host: this.username }
    });
  }

  /** Copy room code */
  copyCode() {
    navigator.clipboard.writeText(this.roomCode);
  }

  /** Share via WhatsApp */
  shareWhatsapp() {
    const url = `https://wa.me/?text=Join my Rock Paper Scissors room! Code: ${this.roomCode}`;
    window.open(url, '_blank');
  }

  /** Handle join code typing */
  onJoinCodeChange(event: any, index: number) {
    const value = (event.target as HTMLInputElement).value;
    if (value && index < 3) {
      const nextInput = document.querySelectorAll('.roomInput')[index + 1] as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  /** Validate join code */
  isJoinCodeValid(): boolean {
    return this.joinCode.join('').length === 4;
  }

  /** Join existing room */
  joinRoom() {
    const enteredCode = this.joinCode.join('');
    this.realtime.joinRoom(enteredCode, this.username);
    this.friendDialog = false;
    this.router.navigate(['/game'], { queryParams: { code: enteredCode, guest: this.username } });
  }


  accents: AccentOption[] = [
    { name: 'Black', val: 'blackGradient' },
    { name: 'Blue', val: 'blueGradient' },
    { name: 'Pink', val: 'pinkGradient' },
    { name: 'Mint', val: 'mintGradient' },
    { name: 'Sunset', val: 'sunsetGradient' },
  ];

  constructor(
    private realtime: Realtime,
    private router: Router,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    // Mark this user as online
    this.realtime.setUserOnline(this.userId);

    // Listen to live viewers count
    this.realtime.listenLiveViewers((count) => {
      this.liveViewersCount = count;
      this.cdr.detectChanges();
    });

    // Get username or generate Guest
    const savedUser = localStorage.getItem('accountLabel');
    this.username = savedUser && savedUser !== 'Login'
      ? savedUser
      : `Guest-${Math.floor(Math.random() * 1000)}`;

    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', 'Computer');
  }

  getRandomPlayerName(): string {
    const randomId = Math.floor(Math.random() * 10000);
    return `Player-${randomId}`;
  }

  // Start Online Game
  startOnlineGame() {
    const randomPlayer = this.getRandomPlayerName();

    // Show waiting dialog
    this.waitingDialog = true;

    // Animate skeletons randomly moving up/down
    this.skeletonInterval = setInterval(() => {
      const left = document.querySelector('.leftPlayer') as HTMLElement;
      const right = document.querySelector('.rightPlayer') as HTMLElement;
      if (left && right) {
        left.style.transform = `translateY(-${Math.random() * 20}px)`;
        right.style.transform = `translateY(-${Math.random() * 20}px)`;
      }
    }, 800)

    // Random delay 5–15 sec
    const waitTime = Math.floor(Math.random() * 11 + 5) * 1000;

    this.waitTimeout = setTimeout(() => {
      this.animatePlayersTogether();
    }, waitTime);

    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', randomPlayer);
    // this.router.navigate(['/game'], { state: { player1: this.username, player2: randomPlayer } });
  }

  animatePlayersTogether() {
    clearInterval(this.skeletonInterval);

    const randomPlayer = this.getRandomPlayerName();
    const left = document.querySelector('.leftPlayer') as HTMLElement;
    const right = document.querySelector('.rightPlayer') as HTMLElement;

    if (left && right) {
      left.style.transition = 'all 1s ease';
      right.style.transition = 'all 1s ease';
      left.style.transform = 'translateX(60px)';
      right.style.transform = 'translateX(-60px)';
    }

    setTimeout(() => {
      this.waitingDialog = false;
      this.router.navigate(['/game'], {
        state: { player1: this.username, player2: randomPlayer }
      });
    }, 1200); // wait for animation to finish
  }

  cancelWaiting() {
    clearTimeout(this.waitTimeout);
    clearInterval(this.skeletonInterval);
    this.waitingDialog = false;
  }

  // Start Game with Computer
  startComputerGame() {
    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', 'Computer');
    this.router.navigate(['/game'], { state: { player1: this.username, player2: 'Computer' } });
  }

  // Start Game with Friend
  startFriendGame() {
    // You could also generate a random friend placeholder here
    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', 'Friend');
    this.router.navigate(['/game'], { state: { player1: this.username, player2: 'Friend' } });
  }

  toggleDarkMode() {
    this.dark = !this.dark;
  }

  setAccent(value: AccentOption['val']) {
    this.accent = value;
  }

  closeMessage() {
    this.message = '';
  }
}
