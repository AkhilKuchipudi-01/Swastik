// ---------------- Play With Friend Game ----------------
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getDatabase, ref, onValue, set, update, off, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-play-with-friend-game',
  standalone: false,
  templateUrl: './play-with-friend-game.html',
  styleUrls: ['./play-with-friend-game.scss']
})
export class PlayWithFriendGame implements OnInit, OnDestroy {
  player1 = 'Host';
  player2 = 'Waiting...';
  score = { wins: 0, losses: 0, ties: 0 };
  result = '';
  playerMoveImg = '../../../assets/heart-emoji.png';
  opponentMoveImg = '../../../assets/heart-emoji.png';

  gameId: string | null = null;
  private gameRef: any;
  waitingForOpponent = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    this.route.queryParams.subscribe(async (params) => {
      if (params['code']) {
        this.gameId = params['code'];
        const roomRef = ref(db, `rooms/${this.gameId}`);
        this.gameRef = roomRef;

        // --- HOST CREATION ---
        if (params['host']) {
          this.player1 = params['host'];

          await set(roomRef, {
            players: {
              player1: { name: this.player1, ready: false, id: user.uid }
            },
            status: 'waiting',
            moves: {}
          });

          sessionStorage.setItem('playerRole', 'player1');
        }

        // --- GUEST JOIN ---
        if (params['guest']) {
          this.player2 = params['guest'];
          const snapshot = await get(roomRef);

          if (snapshot.exists()) {
            const data = snapshot.val();

            if (!data.players?.player2) {
              // Write directly to player2 (fixes rules issue)
              const player2Ref = ref(db, `rooms/${this.gameId}/players/player2`);
              await set(player2Ref, { name: this.player2, ready: false, id: user.uid });

              await update(roomRef, { status: 'ready' });

              sessionStorage.setItem('playerRole', 'player2');
            } else {
              console.error('Room is already full.');
            }
          } else {
            console.error('Game room not found. Cannot join.');
          }
        }

        sessionStorage.setItem('gameId', this.gameId!);

        // ✅ Attach listener AFTER setting host/guest
        this.attachRealtimeListener(db);
      } else {
        // If no query params → resume from session storage
        this.gameId = sessionStorage.getItem('gameId');
        if (this.gameId) {
          this.attachRealtimeListener(db);
        }
      }
    });

    // --- SCORE RESTORE ---
    const savedScore = localStorage.getItem('game_score');
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
  }


  private attachRealtimeListener(db: any) {
    if (!this.gameId) return;

    const roomRef = ref(db, `rooms/${this.gameId}`);
    this.gameRef = roomRef;

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let changed = false;

      // --- Sync Player Names ---
      if (data.players?.player1?.name && this.player1 !== data.players.player1.name) {
        this.player1 = data.players.player1.name;
        changed = true;
      }

      if (data.players?.player2?.name && this.player2 !== data.players.player2.name) {
        this.player2 = data.players.player2.name;
        changed = true;
      }

      // --- Waiting Toggle ---
      this.waitingForOpponent = !(data.players?.player1 && data.players?.player2);

      // --- Moves ---
      const moves = data.moves || {};
      const p1Move = moves.player1;
      const p2Move = moves.player2;

      if (p1Move && p2Move) {
        const myRole = sessionStorage.getItem('playerRole') || 'player1';
        const myMove = moves[myRole as 'player1' | 'player2'];
        const opponentMove = myRole === 'player1' ? p2Move : p1Move;

        this.resolveRound(myMove, opponentMove);
        update(roomRef, { status: 'playing' });
        changed = true;
      }

      if (changed) {
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.gameRef) {
      off(this.gameRef);
    }
  }

  play(playerMove: 'rock' | 'paper' | 'scissor') {
    if (this.waitingForOpponent) {
      this.result = 'Waiting for opponent...';
      return;
    }
    this.submitMove(playerMove);
  }

  private resolveRound(playerMove: 'rock' | 'paper' | 'scissor', opponentMove: 'rock' | 'paper' | 'scissor') {
    if (playerMove === opponentMove) {
      this.result = "It's a tie!";
      this.score.ties++;
    } else if (
      (playerMove === 'rock' && opponentMove === 'scissor') ||
      (playerMove === 'paper' && opponentMove === 'rock') ||
      (playerMove === 'scissor' && opponentMove === 'paper')
    ) {
      this.result = 'You win!';
      this.score.wins++;
    } else {
      this.result = 'You lose!';
      this.score.losses++;
    }

    localStorage.setItem('game_score', JSON.stringify(this.score));

    this.playerMoveImg = `../../../assets/${playerMove}-emoji.png`;
    this.opponentMoveImg = `../../../assets/${opponentMove}-emoji.png`;
  }

  private async submitMove(move: 'rock' | 'paper' | 'scissor') {
    if (!this.gameId) return;
    const db = getDatabase();
    const playerRole = sessionStorage.getItem('playerRole');
    if (!playerRole) return;

    const movesRef = ref(db, `rooms/${this.gameId}/moves`);
    await update(movesRef, { [playerRole]: move });
  }

  resetScore() {
    this.score = { wins: 0, losses: 0, ties: 0 };
    localStorage.removeItem('game_score');
  }

  async resetRound() {
    if (!this.gameId) return;
    const db = getDatabase();
    const movesRef = ref(db, `rooms/${this.gameId}/moves`);
    await set(movesRef, {});
    await update(ref(db, `rooms/${this.gameId}`), { status: 'waiting' });

    this.result = '';
    this.playerMoveImg = '../../../assets/heart-emoji.png';
    this.opponentMoveImg = '../../../assets/heart-emoji.png';
  }
}
