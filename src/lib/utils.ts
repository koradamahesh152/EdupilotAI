import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function xpForLevel(level: number): number {
  return level * 100;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpProgress(xp: number): { current: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const current = xp - (level - 1) * 100;
  const needed = 100;
  return { current, needed, pct: Math.min(100, (current / needed) * 100) };
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function pct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}
