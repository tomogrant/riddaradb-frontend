import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MotifsAll } from "./motifs-all";
import { IMotif } from "../common/IMotif";
import { IMotifSaga } from "../common/IMotifSaga";
import { MotifStore } from "../common/motif.store";
import { of } from "rxjs";
import { signal } from "@angular/core";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { ISagaTitleDto } from "../../sagas/common/ISagaTitleDto";

fdescribe("MotifsAll", () => {
  let activatedRouteMock: any;
  let component: MotifsAll;
  let fixture: ComponentFixture<MotifsAll>;

  let motifSaga: IMotifSaga = {
    sagaVersionId: 1,
    pageChapterNumber: "10",
    inBoberg: true,
  };

  let parentMotif: IMotif = {
    id: 1,
    motifCode: "A1.1.",
    motifName: "Motif",
    description: "Description",
    parentId: null,
    motifSagas: [motifSaga],
  };

  let pinnedNode: IMotif = {
    id: 2,
    motifCode: "A1.1.1.",
    motifName: "Motif",
    description: "Description",
    parentId: 1,
    motifSagas: [motifSaga],
  };

  let sagaTitle: ISagaTitleDto = {
    id: 1,
    title: "Saga title"
  }

  let motifStoreMock = {
    $rootIds: signal([1]),
    $motifNodes: signal(new Map<number, IMotif>([[parentMotif.id!, parentMotif]])),
    $pinnedNodes: signal(new Map<number, IMotif>([[pinnedNode.id!, parentMotif]])),
    $showColourCoding: signal(false),
    $sagaTitles: signal(new Array<ISagaTitleDto>(sagaTitle)),
    $searchActive: signal(false),
    $expandedNodes: signal(new Set<number>()),
    $visibleNodes: signal(new Set<number>()),
    $resultNodes: signal(new Set<number>()),

    initialise: jasmine.createSpy("initialise").and.resolveTo(),
    getRootMotifs: jasmine.createSpy("getRootMotifs").and.resolveTo(),
  };

  beforeEach(async () => {
    activatedRouteMock = {
      paramMap: of(convertToParamMap({})),
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    await TestBed.configureTestingModule({
      imports: [MotifsAll],
      providers: [
        {
          provide: MotifStore,
          useValue: motifStoreMock,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Initialise should load root modules", () => {
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;
    expect(motifStore.initialise).toHaveBeenCalled();
    expect(motifStore.getRootMotifs).toHaveBeenCalled();
  });
});
