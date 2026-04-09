'use client';

import { useState } from 'react';
import { Coffee, UtensilsCrossed, MapPin } from 'lucide-react';
import { Place } from '@/types';

interface PlaceListProps {
  places: Place[];
}

type Tab = 'all' | 'food' | 'cafe';

function isCafe(place: Place) {
  return place.category_name.includes('카페') || place.category_name.includes('커피');
}

function isFood(place: Place) {
  return place.category_name.includes('음식점') || place.category_name.includes('식당');
}

function PlaceCard({ place }: { place: Place }) {
  const cafe = isCafe(place);
  const food = isFood(place);
  const sub = place.category_name.split(' > ').pop() || '';

  return (
    <a
      href={place.place_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {cafe ? (
              <Coffee className="h-4 w-4 shrink-0 text-amber-500" />
            ) : food ? (
              <UtensilsCrossed className="h-4 w-4 shrink-0 text-rose-500" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <p className="truncate font-medium text-slate-900">{place.place_name}</p>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            {place.road_address_name || place.address_name}
          </p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-brand-600">{place.distance}m</p>
        </div>
      </div>
    </a>
  );
}

export default function PlaceList({ places }: PlaceListProps) {
  const [tab, setTab] = useState<Tab>('all');

  const foods = places.filter(isFood);
  const cafes = places.filter(isCafe);
  const others = places.filter((p) => !isFood(p) && !isCafe(p));

  const filtered =
    tab === 'food' ? foods :
    tab === 'cafe' ? cafes :
    places;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: places.length },
    { key: 'food', label: '🍽️ 맛집', count: foods.length },
    { key: 'cafe', label: '☕ 카페', count: cafes.length },
  ];

  return (
    <section className="card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">주변 추천 장소</h2>
        <p className="text-sm text-slate-500">중간 지점 반경 1km</p>
      </div>

      {/* Tab bar */}
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            해당 카테고리 장소를 찾지 못했습니다.
          </div>
        ) : (
          filtered.slice(0, 15).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        )}
      </div>
    </section>
  );
}
