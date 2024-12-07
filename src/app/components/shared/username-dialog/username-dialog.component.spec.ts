import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameDialogComponent } from './username-dialog.component';

describe('UsernameDialogComponent', () => {
  let component: UsernameDialogComponent;
  let fixture: ComponentFixture<UsernameDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsernameDialogComponent]
    });
    fixture = TestBed.createComponent(UsernameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
