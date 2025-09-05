// ---------------- Homepage ----------------
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Realtime } from '../../shared/realtime';

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
  private userId: string = Math.random().toString(36).substring(2, 10);
  username: string = '';

  waitingDialog = false;
  private waitTimeout?: ReturnType<typeof setTimeout>;
  private skeletonInterval?: ReturnType<typeof setInterval>;

  friendDialog = false;
  activeTab: 'Create' | 'Join' = 'Create';

  codeCountdown = 600; // 10 min = 600 seconds
  private codeTimer?: ReturnType<typeof setInterval>;

  roomCode = '';
  joinCode: string[] = ['', '', '', ''];
  player2Joined = false;

  accents: AccentOption[] = [
    { name: 'Black', val: 'blackGradient' },
    { name: 'Blue', val: 'blueGradient' },
    { name: 'Pink', val: 'pinkGradient' },
    { name: 'Mint', val: 'mintGradient' },
    { name: 'Sunset', val: 'sunsetGradient' },
  ];

  constructor(private realtime: Realtime, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.realtime.setUserOnline(this.userId);
    this.generateRoomCode();

    // this.realtime.listenLiveViewers((count) => {
    //   this.liveViewersCount = count;
    //   this.cdr.detectChanges();
    // });

    // Start listening reactively
    this.realtime.listenLiveViewers();
    this.realtime.liveViewers$.subscribe(count => {
      this.liveViewersCount = count;
    });

    const savedUser = localStorage.getItem('accountLabel');
    this.username = savedUser && savedUser !== 'Login'
      ? savedUser
      : `Guest-${Math.floor(Math.random() * 1000)}`;

    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', 'Computer');
  }

  selectTab(tab: 'Create' | 'Join') {
    this.activeTab = tab;
    if (tab === 'Create') {
      this.generateRoomCode();
    }
  }

  generateRoomCode(forceNew: boolean = false) {
    const lastGenerated = sessionStorage.getItem('roomGeneratedAt');
    const existingCode = sessionStorage.getItem('roomCode');
    const now = Date.now();

    if (!forceNew && existingCode && lastGenerated && now - parseInt(lastGenerated, 10) < 10 * 60 * 1000) {
      this.roomCode = existingCode;
    } else {
      this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      sessionStorage.setItem('roomCode', this.roomCode);
      sessionStorage.setItem('roomGeneratedAt', now.toString());
    }

    this.realtime.createRoom(this.roomCode, this.username);
    this.resetCodeTimer();

    this.realtime.onPlayerJoined(this.roomCode, (guest: string) => {
      this.player2Joined = true;
      this.startCreatedGame();
    });
  }

  resetCodeTimer() {
    clearInterval(this.codeTimer);
    this.codeCountdown = 600;

    this.codeTimer = setInterval(() => {
      this.codeCountdown--;
      this.cdr.detectChanges();

      if (this.codeCountdown <= 0) {
        this.refreshRoomCode();
      }
    }, 1000);
  }

  refreshRoomCode() {
    this.generateRoomCode(true);
  }

  async startCreatedGame() {
    this.friendDialog = false;
    sessionStorage.setItem('playerRole', 'player1');

    // Fetch full players object from DB
    const players = await this.realtime.getPlayers(this.roomCode);

    if (players?.player1?.name) {
      sessionStorage.setItem('player1', players.player1.name);
    }
    if (players?.player2?.name) {
      sessionStorage.setItem('player2', players.player2.name);
    }

    this.router.navigate(['/fndgame'], {
      queryParams: { code: this.roomCode, host: this.username }
    });
  }

  copyCode() {
    navigator.clipboard.writeText(this.roomCode);
  }

  shareWhatsapp() {
    const joinUrl = `${window.location.origin}/join/${this.roomCode}`;
    const message = `Join my Rock Paper Scissors room here: ${joinUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  onJoinCodeChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 3) {
      const nextInput = document.querySelectorAll('.roomInput')[index + 1] as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  isJoinCodeValid(): boolean {
    return this.joinCode.join('').length === 4;
  }

  async joinRoom() {
    const enteredCode = this.joinCode.join('');

    await this.realtime.joinRoom(enteredCode, this.username);
    await this.realtime.setPlayerReady(enteredCode, this.username, true);

    sessionStorage.setItem('playerRole', 'player2');
    this.friendDialog = false;
    sessionStorage.setItem('player1', ''); // will be fetched from DB later
    sessionStorage.setItem('player2', this.username);

    this.router.navigate(['/fndgame'], { queryParams: { code: enteredCode, guest: this.username } });
  }

  getRandomPlayerName(): string {
    const randomId = Math.floor(Math.random() * 10000);
    return `Player-${randomId}`;
  }

  startOnlineGame() {
    const randomPlayer = this.getRandomPlayerName();
    this.waitingDialog = true;

    this.skeletonInterval = setInterval(() => {
      const left = document.querySelector('.leftPlayer') as HTMLElement;
      const right = document.querySelector('.rightPlayer') as HTMLElement;
      if (left && right) {
        left.style.transform = `translateY(-${Math.random() * 10}px)`;
        right.style.transform = `translateY(-${Math.random() * 10}px)`;
      }
    }, 800);

    const waitTime = Math.floor(Math.random() * 11 + 5) * 1000;

    this.waitTimeout = setTimeout(() => {
      this.animatePlayersTogether();
    }, waitTime);

    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', randomPlayer);
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
    }, 1200);
  }

  cancelWaiting() {
    clearTimeout(this.waitTimeout);
    clearInterval(this.skeletonInterval);
    this.waitingDialog = false;
  }

  startComputerGame() {
    sessionStorage.setItem('player1', this.username);
    sessionStorage.setItem('player2', 'Computer');
    this.router.navigate(['/game'], { state: { player1: this.username, player2: 'Computer' } });
  }

  startFriendGame() {
    this.friendDialog = true;
    this.selectTab('Create');
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
