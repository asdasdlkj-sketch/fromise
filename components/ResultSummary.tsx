'use client';

import { MapPinned, ExternalLink } from 'lucide-react';
import { MidPoint, Participant, TransportMode } from '@/types';

interface ResultSummaryProps {
  participants: Participant[];
  midPoint: MidPoint;
}

const TRANSPORT_ICONS: Record<TransportMode, string> = {
  walk: '🚶',
  transit: '🚇',
  car: '🚗'
};

// Opens Kakao Maps route from participant's location to midpoint
function openRoute(participant: Participant, midPoint: MidPoint) {
  const url =
    `https://map.kakao.com/link/from/${encodeURIComponent(participant.name)},${participant.lat},${participant.lng}` +
    `/to/${encodeURIComponent(midPoint.name)},${midPoint.lat},${midPoint.lng}`;
  window.open(url, '_blank');
}

export default function ResultSummary({ participants, midPoint }: ResultSummaryProps) {
  const getTime = (participantId: string) =>
    midPoint.participantTimes?.find((t) => t.participantId === participantId)?.minutes ?? null;

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-2xl bg-orange-100 p-2 text-orange-600">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">중간 지점 요약</h2>
          <p className="text-sm text-slate-500">참여자를 누르면 경로를 볼 수 있어요.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-500 p-4 text-white shadow-soft">
        <p className="text-sm text-white/80">추천 만남 장소</p>
        <h3 className="mt-1 text-xl font-semibold">{midPoint.name}</h3>
        <p className="mt-2 text-sm text-white/90">{midPoint.address}</p>
      </div>

      <div className="mt-4 space-y-3">
        {participants.map((participant) => {
          const minutes = getTime(participant.id);
          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => openRoute(participant, midPoint)}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 active:bg-slate-200"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {TRANSPORT_ICONS[participant.transport]} {participant.name}
                </p>
                <p className="truncate text-sm text-slate-500">{participant.address}</p>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1.5">
                <span className="text-sm font-semibold text-brand-700">
                  {minutes !== null ? `약 ${minutes}분` : '-'}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
