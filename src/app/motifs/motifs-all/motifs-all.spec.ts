import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MotifsAll } from "./motifs-all";
import { IMotif } from "../common/IMotif";
import { IMotifSaga } from "../common/IMotifSaga";

fdescribe("MotifsAll", () => {
  let activatedRouteMock: any;
  let component: MotifsAll;
  let fixture: ComponentFixture<MotifsAll>;

  let motifSaga: IMotifSaga = {
    sagaVersionId: 0,
    pageChapterNumber: "10",
    inBoberg: true
  }

  let motif: IMotif = {
    id: null,
    motifCode: "A1.1.",
    motifName: "Motif",
    description: "Description",
    parentId: null,
    motifSagas: [motifSaga]
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotifsAll],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MotifsAll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  
});
