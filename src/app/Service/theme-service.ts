import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  properties: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('green');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private themes: Theme[] = [
    {
      name: 'green',
      displayName: 'Verde Esmeralda',
      properties: {
        '--primary-50': '#ecfdf5',
        '--primary-100': '#d1fae5',
        '--primary-200': '#a7f3d0',
        '--primary-300': '#6ee7b7',
        '--primary-400': '#34d399',
        '--primary-500': '#10b981',
        '--primary-600': '#059669',
        '--primary-700': '#047857',
        '--primary-800': '#065f46',
        '--primary-900': '#064e3b',
        '--primary-950': '#022c22',
        '--secondary-500': '#06d6a0',
        '--accent-500': '#00bcd4',
        '--bg-primary': 'linear-gradient(135deg, #064e3b, #047857, #059669)',
        '--bg-card': 'rgba(16, 185, 129, 0.1)',
        '--bg-sidebar': 'linear-gradient(to bottom right, #0f172a, #064e3b, #022c22)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#d1fae5',
        '--border-color': 'rgba(16, 185, 129, 0.3)',
        '--shadow': '0 25px 50px -12px rgba(6, 78, 59, 0.25)'
      }
    },
    {
      name: 'blue',
      displayName: 'Azul Océano',
      properties: {
        '--primary-50': '#eff6ff',
        '--primary-100': '#dbeafe',
        '--primary-200': '#bfdbfe',
        '--primary-300': '#93c5fd',
        '--primary-400': '#60a5fa',
        '--primary-500': '#3b82f6',
        '--primary-600': '#2563eb',
        '--primary-700': '#1d4ed8',
        '--primary-800': '#1e40af',
        '--primary-900': '#1e3a8a',
        '--primary-950': '#172554',
        '--secondary-500': '#06b6d4',
        '--accent-500': '#8b5cf6',
        '--bg-primary': 'linear-gradient(135deg, #1e3a8a, #1d4ed8, #2563eb)',
        '--bg-card': 'rgba(59, 130, 246, 0.1)',
        '--bg-sidebar': 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #172554)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#dbeafe',
        '--border-color': 'rgba(59, 130, 246, 0.3)',
        '--shadow': '0 25px 50px -12px rgba(30, 58, 138, 0.25)'
      }
    },
    {
      name: 'purple',
      displayName: 'Púrpura Místico',
      properties: {
        '--primary-50': '#faf5ff',
        '--primary-100': '#f3e8ff',
        '--primary-200': '#e9d5ff',
        '--primary-300': '#d8b4fe',
        '--primary-400': '#c084fc',
        '--primary-500': '#a855f7',
        '--primary-600': '#9333ea',
        '--primary-700': '#7c3aed',
        '--primary-800': '#6b21a8',
        '--primary-900': '#581c87',
        '--primary-950': '#3b0764',
        '--secondary-500': '#ec4899',
        '--accent-500': '#f59e0b',
        '--bg-primary': 'linear-gradient(135deg, #581c87, #7c3aed, #9333ea)',
        '--bg-card': 'rgba(168, 85, 247, 0.1)',
        '--bg-sidebar': 'linear-gradient(to bottom right, #0f172a, #581c87, #3b0764)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#f3e8ff',
        '--border-color': 'rgba(168, 85, 247, 0.3)',
        '--shadow': '0 25px 50px -12px rgba(88, 28, 135, 0.25)'
      }
    },
    {
      name: 'orange',
      displayName: 'Naranja Ardiente',
      properties: {
        '--primary-50': '#fff7ed',
        '--primary-100': '#ffedd5',
        '--primary-200': '#fed7aa',
        '--primary-300': '#fdba74',
        '--primary-400': '#fb923c',
        '--primary-500': '#f97316',
        '--primary-600': '#ea580c',
        '--primary-700': '#c2410c',
        '--primary-800': '#9a3412',
        '--primary-900': '#7c2d12',
        '--primary-950': '#431407',
        '--secondary-500': '#ef4444',
        '--accent-500': '#eab308',
        '--bg-primary': 'linear-gradient(135deg, #7c2d12, #c2410c, #ea580c)',
        '--bg-card': 'rgba(249, 115, 22, 0.1)',
        '--bg-sidebar': 'linear-gradient(to bottom right, #0f172a, #7c2d12, #431407)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#ffedd5',
        '--border-color': 'rgba(249, 115, 22, 0.3)',
        '--shadow': '0 25px 50px -12px rgba(124, 45, 18, 0.25)'
      }
    },
    {
      name: 'dark',
      displayName: 'Oscuro Elegante',
      properties: {
        '--primary-50': '#f8fafc',
        '--primary-100': '#f1f5f9',
        '--primary-200': '#e2e8f0',
        '--primary-300': '#cbd5e1',
        '--primary-400': '#94a3b8',
        '--primary-500': '#64748b',
        '--primary-600': '#475569',
        '--primary-700': '#334155',
        '--primary-800': '#1e293b',
        '--primary-900': '#0f172a',
        '--primary-950': '#020617',
        '--secondary-500': '#6366f1',
        '--accent-500': '#06b6d4',
        '--bg-primary': 'linear-gradient(135deg, #020617, #0f172a, #1e293b)',
        '--bg-card': 'rgba(100, 116, 139, 0.1)',
        '--bg-sidebar': 'linear-gradient(to bottom right, #020617, #0f172a, #334155)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#e2e8f0',
        '--border-color': 'rgba(100, 116, 139, 0.3)',
        '--shadow': '0 25px 50px -12px rgba(2, 6, 23, 0.25)'
      }
    }
  ];

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'green';
    this.setTheme(savedTheme);
  }

  setTheme(themeName: string) {
    const theme = this.themes.find(t => t.name === themeName);
    if (!theme) return;

    // Aplicar las variables CSS al root
    const root = document.documentElement;
    Object.keys(theme.properties).forEach(property => {
      root.style.setProperty(property, theme.properties[property]);
    });

    // Guardar tema en localStorage
    localStorage.setItem('app-theme', themeName);
    this.currentThemeSubject.next(themeName);

    // Aplicar clase al body para compatibilidad
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
  }

  getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  getAvailableThemes(): Theme[] {
    return this.themes;
  }

  getThemeDisplayName(themeName: string): string {
    const theme = this.themes.find(t => t.name === themeName);
    return theme ? theme.displayName : themeName;
  }
}
