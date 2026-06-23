import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getAvailableSpots(cls: { totalSpots: number; bookedSpots: number[] }): number {
  return cls.totalSpots - cls.bookedSpots.length;
}

export function isClassFull(cls: { totalSpots: number; bookedSpots: number[] }): boolean {
  return cls.bookedSpots.length >= cls.totalSpots;
}

export function parseClassDateTime(dateStr: string, timeStr: string): Date {
  // timeStr examples: "7:00 AM", "12:00 PM", "5:30 PM"
  const [timePart, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const paddedH = String(hours).padStart(2, '0');
  const paddedM = String(minutes).padStart(2, '0');
  return new Date(`${dateStr}T${paddedH}:${paddedM}:00`);
}

