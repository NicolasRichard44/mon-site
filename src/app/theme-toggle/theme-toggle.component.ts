import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  standalone: true,
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = signal(false);

  ngOnInit(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
    this.updateThemeClass();
  }

  toggleDarkMode(): void {
    this.isDarkMode.set(!this.isDarkMode());
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
    this.updateThemeClass();
  }

  updateThemeClass(): void {
    const html = document.documentElement;
    if (this.isDarkMode()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
