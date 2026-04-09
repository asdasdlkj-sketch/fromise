import { Room } from '@/types';

export function encodeRoom(room: Room): string {
  return btoa(encodeURIComponent(JSON.stringify(room)));
}

export function decodeRoom(encoded: string): Room | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}
