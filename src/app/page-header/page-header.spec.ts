import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PageHeader } from "./page-header";
import { inputBinding } from "@angular/core";

describe("PageHeader", () => {
  let component: PageHeader;
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader, {
      bindings: [
        inputBinding('backgroundImg', () => 'vignette.jpg')
      ]
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
