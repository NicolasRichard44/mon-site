import { Component } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { ProjectsComponent } from './projects/projects.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { ExternalLibsModule } from './shared/external-libs.module';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    ProjectsComponent,
    ContactComponent,
    FooterComponent,
    ThemeToggleComponent,
    ExternalLibsModule,
  ],
  templateUrl: './app.component.html'
})
export class AppComponent { }

