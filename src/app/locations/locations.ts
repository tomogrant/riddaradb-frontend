import { Component, OnInit } from "@angular/core";
import { PageHeader } from "../page-header/page-header";

@Component({
  selector: "app-locations",
  imports: [PageHeader],
  templateUrl: "./locations.html",
  styleUrl: "./locations.css",
})
export class Locations implements OnInit {
  ngOnInit(): void {}
}
