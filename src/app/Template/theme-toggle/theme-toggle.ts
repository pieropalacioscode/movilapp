import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Theme, ThemeService } from '../../Service/theme-service';


@Component({
  selector: 'app-theme-toggle',
  standalone: false,
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css'
})
export class ThemeToggle implements OnInit {
  isOpen = false;
  currentTheme = '';
  availableThemes: Theme[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.availableThemes = this.themeService.getAvailableThemes();
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  selectTheme(themeName: string) {
    this.themeService.setTheme(themeName);
    this.isOpen = false;
  }

  getCurrentThemeDisplayName(): string {
    return this.themeService.getThemeDisplayName(this.currentTheme);
  }

  getThemePreview(theme: Theme, type: 'primary' | 'secondary' | 'accent'): string {
    switch(type) {
      case 'primary':
        return theme.properties['--primary-600'] || '#059669';
      case 'secondary':
        return theme.properties['--secondary-500'] || '#06d6a0';
      case 'accent':
        return theme.properties['--accent-500'] || '#00bcd4';
      default:
        return '#059669';
    }
  }
}