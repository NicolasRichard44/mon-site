import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  projects = [
    {
      title: 'Site Web Angular',
      description: 'Portfolio personnel développé avec Angular 21, TailwindCSS et TypeScript. Architecture moderne avec composants standalone.',
      technologies: ['Angular', 'TypeScript', 'TailwindCSS'],
      status: 'completed',
      link: '#',
      github: 'https://github.com/NicolasRichard44/mon-site'
    },
    {
      title: 'Bot de Trading Crypto',
      description: 'Bot automatisé pour le trading de cryptomonnaies avec analyses techniques, gestion des risques et stratégies d\'investissement.',
      technologies: ['Python', 'APIs Crypto', 'Machine Learning'],
      status: 'work-in-progress',
      link: null,
      github: null
    },
    {
      title: 'Application Bioinformatique',
      description: 'Plateforme de traitement et d\'analyse de données bioinformatiques avec algorithmes de séquençage et visualisation.',
      technologies: ['Python', 'Bioinformatics', 'Data Analysis'],
      status: 'work-in-progress',
      link: null,
      github: null
    },
    {
      title: 'Application Mobile Serveur',
      description: 'Application mobile pour la gestion et surveillance à distance de serveurs avec monitoring en temps réel.',
      technologies: ['Flutter', 'SSH', 'Monitoring'],
      status: 'work-in-progress',
      link: null,
      github: null
    }
  ];
}