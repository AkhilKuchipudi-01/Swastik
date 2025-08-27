import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onDisconnect, onValue, set } from 'firebase/database';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Realtime {
  private app = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.app);

  constructor() { }

  /** ----------------- Viewers (existing feature) ----------------- */

  /** Mark this user as online */
  setUserOnline(userId: string) {
    const userRef = ref(this.db, `viewers/${userId}`);
    set(userRef, true);
    onDisconnect(userRef).remove();
  }

  /** Listen to live viewers count */
  listenLiveViewers(callback: (count: number) => void) {
    const viewersRef = ref(this.db, 'viewers');
    onValue(viewersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const count = Object.keys(data).length;
      callback(count);
    });
  }

  /** ----------------- Multiplayer Rooms ----------------- */

  /** Create a new room */
  createRoom(code: string, host: string) {
    const roomRef = ref(this.db, `rooms/${code}`);
    set(roomRef, {
      host,
      status: 'waiting'
    });
  }

  /** Join an existing room */
  joinRoom(code: string, guest: string) {
    const guestRef = ref(this.db, `rooms/${code}/guest`);
    set(guestRef, guest);
  }

  /** Listen when another player joins */
  onPlayerJoined(code: string, callback: (guest: string) => void) {
    const guestRef = ref(this.db, `rooms/${code}/guest`);
    onValue(guestRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }
}
