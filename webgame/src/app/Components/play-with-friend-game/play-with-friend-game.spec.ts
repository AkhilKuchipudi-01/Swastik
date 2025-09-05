import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayWithFriendGame } from './play-with-friend-game';

describe('PlayWithFriendGame', () => {
  let component: PlayWithFriendGame;
  let fixture: ComponentFixture<PlayWithFriendGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayWithFriendGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayWithFriendGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
