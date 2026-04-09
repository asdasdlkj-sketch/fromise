export type TransportMode = 'walk' | 'transit' | 'car';

export interface Participant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  transport: TransportMode;
}

export interface Room {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: Participant[];
}

export interface Place {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  category_name: string;
  distance: string;
  x: string;
  y: string;
  place_url: string;
}

export interface ParticipantTime {
  participantId: string;
  minutes: number;
}

export interface MidPoint {
  lat: number;
  lng: number;
  name: string;
  address: string;
  participantTimes: ParticipantTime[];
}
