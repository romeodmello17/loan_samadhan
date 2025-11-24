import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmiSection } from './emi-section';

describe('EmiSection', () => {
  let component: EmiSection;
  let fixture: ComponentFixture<EmiSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmiSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
