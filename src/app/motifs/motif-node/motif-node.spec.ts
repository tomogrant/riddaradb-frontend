import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MotifNode } from "./motif-node";
import { IMotif } from "../common/IMotif";
import { MotifStore } from "../common/motif.store";
import { inputBinding, signal } from "@angular/core";
import { ISagaTitleDto } from "../../sagas/common/ISagaTitleDto";
import { AuthService } from "../../auth/auth.service";
import { MotifModalService } from "../common/motif-modal.service";

describe("MotifNode", () => {
  let component: MotifNode;
  let fixture: ComponentFixture<MotifNode>;

  let parentMotif: IMotif = {
    id: 1,
    motifCode: "A1.1.",
    motifName: "Motif",
    description: "Description",
    parentId: null,
    hasChildren: true,
    motifSagas: [],
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

  let authServiceMock = {
    $loggedIn: signal(true),
    $isAdmin: signal(true),
  };

  function initialiseMotifStoreMock() {
    return jasmine.createSpyObj(
      //Argument 1: descriptive name
      "MotifStore",
      //Argument 2: list of functions to mock
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
        "expand",
        "getMotifChildren",
      ],
      //Argument 3: list of properties to mock
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
    motifStoreMock = initialiseMotifStoreMock();
    motifStoreMock.getMotifNode.and.returnValue(parentMotif);

    let motifModalServiceMock = jasmine.createSpyObj<MotifModalService>([
      "openAddModal",
      "openEditModal",
      "openDeleteModal",
    ]);

    authServiceMock.$isAdmin.set(true);
    authServiceMock.$loggedIn.set(true);

    await TestBed.configureTestingModule({
      imports: [MotifNode],
      providers: [
        {
          provide: MotifStore,
          useValue: motifStoreMock,
        },
        {
          provide: MotifModalService,
          useValue: motifModalServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();
  });

  it("Node should be created", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });

    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.$node()?.id).not.toBeNull();
  });

  it("Edit/add/delete buttons should be hidden to unauthorised users", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;
    authServiceMock.$loggedIn.set(false);
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).toBeNull();
    expect(addButton).toBeNull();
    expect(deleteButton).toBeNull();
  });

  it("Edit/add/delete buttons should be shown to authorised users", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(editButton).not.toBeNull();
    expect(addButton).not.toBeNull();
    expect(deleteButton).not.toBeNull();
  });

  it("Contributors cannot delete motifs with children", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;
    authServiceMock.$isAdmin.set(false);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(deleteButton).toBeNull();
  });

  it("Contributors can delete motifs lacking children", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });

    const childlessMotif = { ...parentMotif };
    childlessMotif.hasChildren = false;
    motifStoreMock.$motifNodes.set(new Map([[childlessMotif.id!, childlessMotif]]));

    component = fixture.componentInstance;
    authServiceMock.$isAdmin.set(false);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');

    expect(deleteButton).not.toBeNull();
  });

  it("User can add new motif", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const motifModalService = TestBed.inject(MotifModalService) as jasmine.SpyObj<MotifModalService>;
    spyOn(component, "openAddModal").and.callThrough();

    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-button"]');
    addButton.click();
    fixture.detectChanges();

    expect(component.openAddModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openAddModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openAddModal).toHaveBeenCalledWith(1);
  });

  it("User can edit existing motif", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const motifModalService = TestBed.inject(MotifModalService) as jasmine.SpyObj<MotifModalService>;
    spyOn(component, "openEditModal").and.callThrough();

    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    editButton.click();
    fixture.detectChanges();

    expect(component.openEditModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openEditModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openEditModal).toHaveBeenCalledWith(1);
  });

  it("User can delete existing motif", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const motifModalService = TestBed.inject(MotifModalService) as jasmine.SpyObj<MotifModalService>;
    spyOn(component, "openDeleteModal").and.callThrough();

    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');
    deleteButton.click();
    fixture.detectChanges();

    expect(component.openDeleteModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openDeleteModal).toHaveBeenCalledTimes(1);
    expect(motifModalService.openDeleteModal).toHaveBeenCalledWith(1);
  });

  [1, 2].forEach((depth) => {
    it("Toggle motif button should be hidden on depth " + depth, () => {
      fixture = TestBed.createComponent(MotifNode, {
        bindings: [inputBinding("$depth", () => depth), inputBinding("$nodeId", () => 1)],
      });
      component = fixture.componentInstance;

      spyOn(component, "togglePinnedNode");

      fixture.detectChanges();

      const togglePinnedButton = fixture.nativeElement.querySelector('[data-testid="toggle-pinned-button"]');

      expect(togglePinnedButton).toBeNull();
      expect(component.togglePinnedNode).not.toHaveBeenCalled();
    });
  });

  it("User can toggle pinned motif", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 3), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;
    spyOn(component, "togglePinnedNode").and.callThrough();

    fixture.detectChanges();

    const togglePinnedButton = fixture.nativeElement.querySelector('[data-testid="toggle-pinned-button"]');
    togglePinnedButton.click();
    fixture.detectChanges();

    expect(component.togglePinnedNode).toHaveBeenCalledTimes(1);
    expect(motifStore.togglePinnedNode).toHaveBeenCalledTimes(1);
    expect(motifStore.togglePinnedNode).toHaveBeenCalledWith(1);
  });

  it("User can expand motif with children", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const motifStore = TestBed.inject(MotifStore) as jasmine.SpyObj<MotifStore>;
    spyOn(component, "toggleExpand").and.callThrough();

    fixture.detectChanges();

    const expandButton = fixture.nativeElement.querySelector('[data-testid="toggle-expand-button"]');
    expandButton.click();
    fixture.detectChanges();

    expect(component.toggleExpand).toHaveBeenCalledTimes(1);
    expect(motifStore.expand).toHaveBeenCalledTimes(1);
    expect(motifStore.expand).toHaveBeenCalledWith(1);
  });

  it("User can't expand motif lacking children", () => {
    fixture = TestBed.createComponent(MotifNode, {
      bindings: [inputBinding("$depth", () => 1), inputBinding("$nodeId", () => 1)],
    });
    component = fixture.componentInstance;

    const childlessMotif = { ...parentMotif };
    childlessMotif.hasChildren = false;
    motifStoreMock.$motifNodes.set(new Map([[childlessMotif.id!, childlessMotif]]));

    fixture.detectChanges();

    const expandButton = fixture.nativeElement.querySelector('[data-testid="toggle-expand-button"]');

    expect(expandButton).toBeNull();
  });
});
