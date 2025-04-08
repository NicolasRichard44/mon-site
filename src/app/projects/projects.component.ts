import { Component } from '@angular/core';
import { EchecsComponent } from "../echecs/echecs.component";

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  imports: [EchecsComponent]
})
export class ProjectsComponent {}