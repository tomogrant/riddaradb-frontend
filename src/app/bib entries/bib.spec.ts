import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibComponent } from './bib';

describe('Bibs', () => {
  let component: BibComponent;
  let fixture: ComponentFixture<BibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
