import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Supportus } from './supportus';

describe('Supportus', () => {
  let component: Supportus;
  let fixture: ComponentFixture<Supportus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Supportus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Supportus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
