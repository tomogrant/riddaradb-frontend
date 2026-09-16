import { Component, OnInit } from '@angular/core';
import { PageHeader } from '../shared/page-header/page-header';

@Component({
  selector: 'app-characters',
  imports: [PageHeader],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters implements OnInit {

  ngOnInit(): void {
    
  }

}
