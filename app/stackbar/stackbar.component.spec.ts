import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackbarComponent } from './stackbar.component';

describe('StackbarComponent', () => {
  let component: StackbarComponent;
  let fixture: ComponentFixture<StackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
