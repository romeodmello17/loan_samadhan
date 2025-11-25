import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whyus } from './whyus';

describe('Whyus', () => {
  let component: Whyus;
  let fixture: ComponentFixture<Whyus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whyus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Whyus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
