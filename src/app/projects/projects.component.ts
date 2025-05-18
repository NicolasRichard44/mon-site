import { Component } from '@angular/core';
import { EchecsComponent } from "../echecs/echecs.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  imports: [EchecsComponent, RouterModule, CommonModule]
})
export class ProjectsComponent {
  showChess = false;

  toggleChessGame(): void {
    this.showChess = !this.showChess;
  }
}