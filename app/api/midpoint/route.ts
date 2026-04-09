import { NextRequest, NextResponse } from 'next/server';
import { Participant, TransportMode } from '@/types';

const SPEED_KMH: Record<TransportMode, number> = {
  walk: 4,
  transit: 12,
  car: 22
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get real transit time via ODSAY API
async function getTransitMinutes(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<number | null> {
  const key = process.env.ODSAY_API_KEY;
  if (!key) return null;

  try {
    const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${fromLng}&SY=${fromLat}&EX=${toLng}&EY=${toLat}&apiKey=${encodeURIComponent(key)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const totalTime = data?.result?.path?.[0]?.info?.totalTime;
    return typeof totalTime === 'number' ? totalTime : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const participants: Participant[] = body.participants;

  if (!participants || participants.length === 0) {
    return NextResponse.json({ error: 'participants required' }, { status: 400 });
  }

  const avgLat = participants.reduce((s, p) => s + p.lat, 0) / participants.length;
  const avgLng = participants.reduce((s, p) => s + p.lng, 0) / participants.length;

  // Fetch candidate subway stations
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=지하철역&x=${avgLng}&y=${avgLat}&radius=5000&sort=distance&size=10`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Kakao API error' }, { status: 502 });
  }

  const data = await res.json();
  const candidates = data.documents ?? [];

  if (candidates.length === 0) {
    const times = participants.map((p) => ({ participantId: p.id, minutes: 0 }));
    return NextResponse.json({ lat: avgLat, lng: avgLng, name: '중간 지점', address: '주변 지하철역 없음', participantTimes: times });
  }

  // Step 1: rough scoring to pick top 3 candidates
  const scored = candidates.map((station: any) => {
    const stLat = parseFloat(station.y);
    const stLng = parseFloat(station.x);
    const roughTimes = participants.map((p) => {
      const km = haversineKm(p.lat, p.lng, stLat, stLng);
      const speed = SPEED_KMH[p.transport] ?? 12;
      return (km / speed) * 60;
    });
    const maxTime = Math.max(...roughTimes);
    const mean = roughTimes.reduce((s, v) => s + v, 0) / roughTimes.length;
    const variance = roughTimes.reduce((s, v) => s + (v - mean) ** 2, 0) / roughTimes.length;
    return { station, score: maxTime + variance * 0.5 };
  });

  scored.sort((a: any, b: any) => a.score - b.score);
  const top3 = scored.slice(0, 3);

  // Step 2: get real ODSAY times for transit participants, then re-score
  let bestCandidate = top3[0].station;
  let bestScore = Infinity;
  let bestTimes: { participantId: string; minutes: number }[] = [];

  for (const { station } of top3) {
    const stLat = parseFloat(station.y);
    const stLng = parseFloat(station.x);

    // Fetch real transit times in parallel
    const timePromises = participants.map(async (p) => {
      if (p.transport === 'transit') {
        const real = await getTransitMinutes(p.lat, p.lng, stLat, stLng);
        if (real !== null) return { participantId: p.id, minutes: real };
      }
      // Fallback: speed estimate
      const km = haversineKm(p.lat, p.lng, stLat, stLng);
      const speed = SPEED_KMH[p.transport] ?? 12;
      return { participantId: p.id, minutes: Math.round((km / speed) * 60) };
    });

    const times = await Promise.all(timePromises);
    const minuteValues = times.map((t) => t.minutes);
    const maxTime = Math.max(...minuteValues);
    const mean = minuteValues.reduce((s, v) => s + v, 0) / minuteValues.length;
    const variance = minuteValues.reduce((s, v) => s + (v - mean) ** 2, 0) / minuteValues.length;
    const score = maxTime + variance * 0.5;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = station;
      bestTimes = times;
    }
  }

  return NextResponse.json({
    lat: parseFloat(bestCandidate.y),
    lng: parseFloat(bestCandidate.x),
    name: bestCandidate.place_name,
    address: bestCandidate.road_address_name || bestCandidate.address_name || '',
    participantTimes: bestTimes
  });
}
