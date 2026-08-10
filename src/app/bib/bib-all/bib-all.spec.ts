import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibAll } from './bib-all';
import { BibService } from '../common/bib.service';
import { IBib, PublicationType } from '../common/IBib';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('BibAll', () => {
  let component: BibAll;
  let fixture: ComponentFixture<BibAll>;
  let bib: IBib = {
    id: 1,
    publicationType: PublicationType.OTHER,
    authors: "T. Grant",
    editors: "J. Hui",
    translators: "B. Allport",
    title: "Title",
    url: "www.url.com",
    bookEditors: "E. Editor",
    book: "Book name",
    bookSeries: "Book series",
    volume: "Volume",
    numOfVolumes: "1",
    placeOfPublication: "Cambridge",
    publisher: "Cambridge University Press",
    publicationYear: "2026",
    pageNumbers: "10-15",
    sagaIds: [],
    recommended: false,
    description: "Description"
  };
  
  let bibs: IBib[] = [bib];

  beforeEach(async () => {
    const bibServiceSpy = jasmine.createSpyObj<BibService>(['getBibEntries']);
    bibServiceSpy.getBibEntries.and.callFake(function (){
      return of(bibs);
    });

    await TestBed.configureTestingModule({
      imports: [BibAll],
      providers: [
        {
          provide: BibService,
          useValue: bibServiceSpy
        },
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BibAll);
    component = fixture.componentInstance;
    //The first time this is run it will execute the constructor and run ngOnInit().
    fixture.detectChanges();
  });

  it('Component should be defined', () => {
    expect(component).toBeDefined();
  });

  it('Header should read "Bibliography"', () => {
    const bibAllElement: HTMLElement = fixture.nativeElement;
    const header = bibAllElement.querySelector('h1');
    if (header)
      expect(header.textContent).toContain('Bibliography');
  });

  it('ngOnInit should return bibliography entries', () => {
    expect(component.bibs.length).toBeGreaterThanOrEqual(1);
    expect(component.bibs[0].title).toEqual(bib.title);
    expect(component.bibsVm.length).toBeGreaterThanOrEqual(1);
  });
});
