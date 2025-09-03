// shared/realtime.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onDisconnect,
  onValue,
  set,
  update,
  get,
  remove
} from 'firebase/database';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Realtime {
  private app = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.app);

  constructor() { }

  /** Track viewers online */
  setUserOnline(userId: string) {
    const userRef = ref(this.db, `viewers/${userId}`);
    set(userRef, true);
    onDisconnect(userRef).remove();
  }

  listenLiveViewers(callback: (count: number) => void) {
    const viewersRef = ref(this.db, 'viewers');
    onValue(viewersRef, (snapshot) => {
      const data = snapshot.val() || {};
      callback(Object.keys(data).length);
    });
  }

  /** Create a room with player1 as host */
  async createRoom(code: string, host: string) {
    const roomRef = ref(this.db, `rooms/${code}`);
    const snap = await get(roomRef);

    if (!snap.exists()) {
      await set(roomRef, {
        status: 'waiting',
        players: {
          player1: { name: host, ready: false }
        },
        moves: {}
      });
    }
  }

  /** Join as player2 (only if empty) */
  async joinRoom(code: string, guest: string) {
    const roomRef = ref(this.db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists()) throw new Error('Room does not exist');
    const data = snap.val();

    if (data.players?.player2) throw new Error('Room full');

    const player2Ref = ref(this.db, `rooms/${code}/players/player2`);
    await set(player2Ref, { name: guest, ready: false });
    await update(roomRef, { status: 'ready' });
  }

  /** Watch when player2 joins */
  onPlayerJoined(code: string, callback: (guest: string) => void) {
    const player2Ref = ref(this.db, `rooms/${code}/players/player2`);
    onValue(player2Ref, (snap) => {
      const p2 = snap.val();
      if (p2?.name) callback(p2.name);
    });
  }

  /** Watch full players object */
  onPlayersUpdate(code: string, callback: (players: any) => void) {
    const playersRef = ref(this.db, `rooms/${code}/players`);
    onValue(playersRef, (snap) => {
      callback(snap.val() || {});
    });
  }

  /** Mark player ready */
  async setPlayerReady(code: string, usernameOrRole: string, ready: boolean) {
    const playersRef = ref(this.db, `rooms/${code}/players`);
    const snap = await get(playersRef);
    const players = snap.val() || {};

    // detect slot
    let slot: string | null = null;
    for (const k of Object.keys(players)) {
      const p = players[k];
      if (p?.name === usernameOrRole || k === usernameOrRole) {
        slot = k;
        break;
      }
    }
    if (!slot) return;

    const playerRef = ref(this.db, `rooms/${code}/players/${slot}`);
    await update(playerRef, { ready });

    // check if both ready
    const fresh = (await get(playersRef)).val() || {};
    if (fresh.player1?.ready && fresh.player2?.ready) {
      const roomRef = ref(this.db, `rooms/${code}`);
      await update(roomRef, { status: 'playing' });
    }
  }

  /** Watch both players becoming ready */
  onBothPlayersReady(code: string, callback: () => void) {
    const playersRef = ref(this.db, `rooms/${code}/players`);
    onValue(playersRef, (snap) => {
      const p = snap.val() || {};
      if (p.player1?.ready && p.player2?.ready) callback();
    });
  }

  /** Submit move */
  async submitMove(code: string, usernameOrRole: string, move: string) {
    const playersRef = ref(this.db, `rooms/${code}/players`);
    const snap = await get(playersRef);
    const players = snap.val() || {};

    let slot: string | null = null;
    for (const k of Object.keys(players)) {
      const p = players[k];
      if (p?.name === usernameOrRole || k === usernameOrRole) {
        slot = k;
        break;
      }
    }
    if (!slot) return;

    const moveRef = ref(this.db, `rooms/${code}/moves/${slot}`);
    await set(moveRef, move);
  }

  /** Watch moves */
  listenMoves(code: string, callback: (moves: any) => void) {
    const movesRef = ref(this.db, `rooms/${code}/moves`);
    onValue(movesRef, (snap) => callback(snap.val() || {}));
  }

  /** Reset moves for new round */
  resetRound(code: string) {
    const movesRef = ref(this.db, `rooms/${code}/moves`);
    set(movesRef, {});
  }

  /** Delete room when game ends */
  async deleteRoom(code: string) {
    const roomRef = ref(this.db, `rooms/${code}`);
    await remove(roomRef);
  }
}