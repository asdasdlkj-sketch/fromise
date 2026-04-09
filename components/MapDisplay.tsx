'use client';

import { useEffect, useRef } from 'react';
import { MidPoint, Participant } from '@/types';

interface MapDisplayProps {
  participants: Participant[];
  midPoint: MidPoint;
}

export default function MapDisplay({ participants, midPoint }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (cancelled || !mapRef.current) return;

      // Destroy previous instance if re-rendering
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView([midPoint.lat, midPoint.lng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      // Participant markers (blue)
      const blueIcon = L.divIcon({
        className: '',
        html: `<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      participants.forEach((p) => {
        const latlng = L.latLng(p.lat, p.lng);
        bounds.extend(latlng);

        const marker = L.marker(latlng, { icon: blueIcon }).addTo(map);
        marker.bindPopup(`<b>${p.name}</b><br/><small>${p.address}</small>`);

        // Draw line to midpoint
        L.polyline(
          [latlng, L.latLng(midPoint.lat, midPoint.lng)],
          { color: '#2563eb', weight: 1.5, dashArray: '5,5', opacity: 0.5 }
        ).addTo(map);
      });

      // Midpoint marker (orange/red)
      const midIcon = L.divIcon({
        className: '',
        html: `<div style="background:#f97316;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const midMarker = L.marker([midPoint.lat, midPoint.lng], { icon: midIcon }).addTo(map);
      midMarker.bindPopup(`<b>${midPoint.name}</b><br/><small>${midPoint.address}</small>`).openPopup();
      bounds.extend(L.latLng(midPoint.lat, midPoint.lng));

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };

    initMap().catch(console.error);

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [participants, midPoint]);

  return (
    <section className="card overflow-hidden p-3">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="h-[320px] w-full rounded-[24px]" />
    </section>
  );
}
