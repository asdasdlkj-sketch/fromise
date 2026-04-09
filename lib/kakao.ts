import { MidPoint, Participant, Place } from '@/types';

declare global {
  interface Window {
    kakao: any;
    daum: any;
  }
}

const KAKAO_SCRIPT_ID = 'kakao-maps-sdk';
const POSTCODE_SCRIPT_ID = 'daum-postcode-sdk';

export function ensurePostcodeScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (document.getElementById(POSTCODE_SCRIPT_ID)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = POSTCODE_SCRIPT_ID;
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('주소 검색 스크립트를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
}

export function loadKakaoMaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao Maps can only load in the browser.'));
  }

  if (window.kakao?.maps?.Map) {
    return new Promise((resolve) => {
      window.kakao.maps.load(() => resolve(window.kakao));
    });
  }

  if (document.getElementById(KAKAO_SCRIPT_ID)) {
    return new Promise((resolve) => {
      const check = () => {
        if (window.kakao?.maps?.Map) {
          window.kakao.maps.load(() => resolve(window.kakao));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = KAKAO_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.onload = () => {
      if (!window.kakao) {
        reject(new Error('Kakao Maps SDK loaded but kakao object is unavailable.'));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('지도를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '주소를 좌표로 변환하지 못했습니다.');
  }
  return res.json();
}

export async function calcMidpoint(participants: Participant[]): Promise<MidPoint> {
  if (participants.length === 0) throw new Error('참여자 정보가 없습니다.');

  const res = await fetch('/api/midpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants })
  });

  if (!res.ok) {
    throw new Error('중간 지점을 찾지 못했습니다.');
  }
  return res.json();
}

export async function searchNearbyPlaces(midPoint: MidPoint): Promise<Place[]> {
  const [foodRes, cafeRes] = await Promise.all([
    fetch(`/api/places?lat=${midPoint.lat}&lng=${midPoint.lng}&category=FD6`),
    fetch(`/api/places?lat=${midPoint.lat}&lng=${midPoint.lng}&category=CE7`)
  ]);

  const food: Place[] = foodRes.ok ? await foodRes.json() : [];
  const cafes: Place[] = cafeRes.ok ? await cafeRes.json() : [];

  const merged = [...food, ...cafes];
  const unique = new Map<string, Place>();
  for (const place of merged) {
    if (!unique.has(place.id)) unique.set(place.id, place);
  }

  return Array.from(unique.values()).sort(
    (a, b) => Number(a.distance || '0') - Number(b.distance || '0')
  );
}
