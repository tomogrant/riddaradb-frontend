import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MotifsAll } from "./motifs-all";
import { IMotif } from "../common/IMotif";
import { IMotifSaga } from "../common/IMotifSaga";
import { MotifStore } from "../common/motif.store";
import { signal } from "@angular/core";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { ISagaTitleDto } from "../../sagas/common/ISagaTitleDto";
import { AuthService } from "../../auth/auth.service";
import { MotifModalService } from "../common/motif-modal.service";

describe("MotifsAll", () => {
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

  let sagaTitle: ISagaTitleDto = {
    id: 1,
    title: "Saga title",
  };

  let pinnedNodesMap = new Map<number, IMotif>([
    [createMotif(1).id!, createMotif(1)],
    [createMotif(2).id!, createMotif(2)],
    [createMotif(3).id!, createMotif(3)],
  ]);

  let motifStoreMock = initialiseMotifStoreMock();

  let motifModalServiceMock = jasmine.createSpyObj<MotifModalService>("MotifModalService", ["openAddModal"], {
    $modalState: signal(null),
  });

  let authServiceMock = {
    $loggedIn: signal(true),
    $isAdmin: signal(true),
  };

  function initialiseMotifStoreMock() {
    return jasmine.createSpyObj(
      "MotifStore",
      [
        "initialise",
        "search",
        "togglePinnedNode",
        "movePinnedNode",
        "clearSearch",
        "toggleColourCoding",
        "collapseAll",
        "clearPinnedNodes",
        "getMotifNode",
      ],
      {
        $rootIds: signal(new Set([1])),
        $motifNodes: signal(new Map<number, IMotif>([[parentMotif.id!, parentMotif]])),
        $pinnedNodes: signal(new Map<number, IMotif>(pinnedNodesMap)),
        $showColourCoding: signal(false),
        $sagaTitles: signal(new Array<ISagaTitleDto>(sagaTitle)),
        $searchActive: signal(false),
        $expandedNodes: signal(new Set<number>()),
        $visibleNodes: signal(new Set<number>()),
        $resultNodes: signal(new Set<number>()),
      },
    );
  }

  function createMotif(id: number): IMotif {
    return {
      id: id,
      motifCode: "example code",
      motifName: "example name",
      description: "example description",
      parentId: 1,
      motifSagas: [],
    };
  }

  beforeEach(async () => {
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    authServiceMock.$isAdmin.set(true);
    authServiceMock.$loggedIn.set(true);

    motifStoreMock = initialiseMotifStoreMock();

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
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: MotifModalService,
          useValue: motifModalServiceMock,
        },
      ],
    }).compileComponents();
  });

  it("Initialise should load root modules", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;
    fixture.detectChanges();

    expect(motifStore.initialise).toHaveBeenCalled();
    expect(component.$rootIds().size).toBeGreaterThan(0);
  });

  it("Add motif button should be hidden to unauthorised users", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    authServiceMock.$loggedIn.set(false);
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    expect(addButton).toBeNull();
  });

  it("Add motif button should be exposed to authorised users", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    authServiceMock.$loggedIn.set(true);
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    expect(addButton).not.toBeNull();
  });

  it("Search route param activates search", async () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ searchterm: "term" });
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    await component.initialise();
    fixture.detectChanges();

    expect(component.searchForm.searchTerm().value()).toEqual("term");
  });

  it("Blank search bar deactivates search button", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    component.searchForm.searchTerm().value.set("");
    fixture.detectChanges();

    const searchButton = fixture.nativeElement.querySelector('[data-testid="search-button"]');

    expect(searchButton.disabled).toBeTrue();
  });

  it("Filled search bar activates search button", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    component.searchForm.searchTerm().value.set("search term");
    fixture.detectChanges();

    const searchButton = fixture.nativeElement.querySelector('[data-testid="search-button"]');

    expect(searchButton.disabled).toBeFalse();
  });

  it("Clear search button clears search", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const searchButton = fixture.nativeElement.querySelector('[data-testid="search-button"]');
    const clearButton = fixture.nativeElement.querySelector('[data-testid="clear-button"]');
    clearButton.click();

    fixture.detectChanges();

    expect(motifStore.clearSearch).toHaveBeenCalledTimes(1);
    expect(searchButton.disabled).toBeTrue();
  });

  it("Toggle colour coding button toggles colour coding", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const toggleButton = fixture.nativeElement.querySelector('[data-testid="toggle-colour-coding-button"]');
    toggleButton.click();

    fixture.detectChanges();

    expect(motifStore.toggleColourCoding).toHaveBeenCalledTimes(1);
  });

  it("Collapse all button collapses all", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const collapseButton = fixture.nativeElement.querySelector('[data-testid="collapse-all-button"]');
    collapseButton.click();

    fixture.detectChanges();

    expect(motifStore.collapseAll).toHaveBeenCalledTimes(1);
  });

  it("Clear pinned nodes button clears pinned nodes", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('[data-testid="clear-pinned-nodes-button"]');
    clearButton.click();

    fixture.detectChanges();

    expect(motifStore.clearPinnedNodes).toHaveBeenCalledTimes(1);
  });

  it("Pinned nodes can be unpinned", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const toggleButton = fixture.nativeElement.querySelector('[data-testid="toggle-pinned-node-button-0"]');
    toggleButton.click();

    fixture.detectChanges();

    //Expect motif store toggle to have been called with the ID of the first motif in the $pinnedNodes map
    expect(motifStore.togglePinnedNode).toHaveBeenCalledWith(pinnedNodesMap.keys().next().value!);
    expect(toggleButton).not.toBeNull();
  });

  it("Pinned node which is not first or last can be moved left", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const moveLeftButton = fixture.nativeElement.querySelector('[data-testid="move-pinned-node-left-button-1"]');
    moveLeftButton.click();

    fixture.detectChanges();

    expect(motifStore.movePinnedNode).toHaveBeenCalledWith(2, -1);
  });

  it("Pinned node which is not first or last can be moved right", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;

    fixture.detectChanges();

    const moveRightButton = fixture.nativeElement.querySelector('[data-testid="move-pinned-node-right-button-1"]');
    moveRightButton.click();

    fixture.detectChanges();

    expect(motifStore.movePinnedNode).toHaveBeenCalledWith(2, 1);
  });

  it("First pinned node on pinboard cannot be moved left", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const moveLeftButton = fixture.nativeElement.querySelector('[data-testid="move-pinned-node-left-button-0"]');

    expect(moveLeftButton.disabled).toBeTrue();
  });

  it("Last pinned node on pinboard cannot be moved right", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const moveRightButton = fixture.nativeElement.querySelector('[data-testid="move-pinned-node-right-button-2"]');

    expect(moveRightButton.disabled).toBeTrue();
  });

  it("Add new motif button opens add modal", () => {
    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    const motifModalService = TestBed.inject(MotifModalService) as jasmine.SpyObj<MotifModalService>;
    spyOn(component, "openAddModal").and.callThrough();

    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-new-motif-button"]');
    addButton.click();

    fixture.detectChanges();

    expect(component.openAddModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openAddModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openAddModal).toHaveBeenCalledWith();
  });
});
