import { Injectable } from '@angular/core';
import { Firestore, doc, docData, updateDoc, setDoc, DocumentReference } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Room {
  room$: Observable<any> | null = null;
  private roomId: string | null = null;
  private uid: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    // Correctly get the user's UID when their authentication state changes
    onAuthStateChanged(this.auth, user => {
      this.uid = user ? user.uid : null;
    });
  }

  /** Create a new room (Player1) */
  async createRoom(roomId: string) {
    if (!this.uid) return;
    this.roomId = roomId;
    const ref = doc(this.firestore, `rooms/${roomId}`);
    await setDoc(ref, {
      id: roomId,
      maxPlayers: 2,
      players: {
        player1: { id: this.uid, ready: false }
      },
      moves: {}
    });
    this.room$ = docData(ref, { idField: 'id' });
  }

  /** Join as Player2 */
  async joinRoom(roomId: string) {
    if (!this.uid) return;
    this.roomId = roomId;
    const ref = doc(this.firestore, `rooms/${roomId}`);
    await updateDoc(ref, {
      [`players.player2`]: { id: this.uid, ready: false }
    });
    this.room$ = docData(ref, { idField: 'id' });
  }

  /** Mark yourself as ready */
  async setReady() {
    if (!this.roomId || !this.uid) return;
    const ref = doc(this.firestore, `rooms/${this.roomId}`);
    const currentPlayer = await this.getCurrentPlayerId();
    if (currentPlayer) {
      await updateDoc(ref, {
        [`players.${currentPlayer}.ready`]: true
      });
    }
  }

  /** Submit move (rock/paper/scissors) */
  async submitMove(move: string) {
    if (!this.roomId || !this.uid) return;
    const ref = doc(this.firestore, `rooms/${this.roomId}`);
    const currentPlayer = await this.getCurrentPlayerId();
    if (currentPlayer) {
      await updateDoc(ref, {
        [`moves.${currentPlayer}`]: move
      });
    }
  }

  /** Helper: check if current user is Player1 or Player2 */
  private async getCurrentPlayerId(): Promise<'player1' | 'player2' | null> {
    if (!this.room$) {
      return null;
    }
    const roomData = await this.room$.pipe(take(1)).toPromise();
    if (roomData.players.player1.id === this.uid) {
      return 'player1';
    } else if (roomData.players.player2.id === this.uid) {
      return 'player2';
    }
    return null;
  }

  /** Leave and clean up the room state */
  async leaveRoom() {
    this.roomId = null;
    this.room$ = null;
  }
}