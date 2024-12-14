import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserStoryComponent } from './create-user-story.component';

describe('CreateUserStoryComponent', () => {
  let component: CreateUserStoryComponent;
  let fixture: ComponentFixture<CreateUserStoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateUserStoryComponent]
    });
    fixture = TestBed.createComponent(CreateUserStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
