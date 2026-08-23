import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService, ConfirmationService } from 'primeng/api';

import { InputPopup } from './input-popup';

describe('InputPopup', () => {
  let component: InputPopup;
  let fixture: ComponentFixture<InputPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPopup],
      providers: [MessageService, ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(InputPopup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
