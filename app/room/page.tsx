'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Link2, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { decodeRoom, encodeRoom } from '@/lib/room';
import { calcMidpoint, searchNearbyPlaces } from '@/lib/kakao';
import { MidPoint, Participant, Place, Room } from '@/types';
import JoinForm from '@/components/JoinForm';
import MapDisplay from '@/components/MapDisplay';
import ResultSummary from '@/components/ResultSummary';
import PlaceList from '@/components/PlaceList';

const TRANSPORT_ICONS: Record<string, string> = { walk: '🚶', transit: '🚇', car: '🚗' };
const TRANSPORT_LABELS: Record<string, string> = { walk: '도보', transit: '대중교통', car: '자동차' };

function formatDate(date: string, time: string) {
  if (!date) return '';
  const d = new Date(`${date}T${time || '00:00'}`);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) +
    (time ? ` ${time}` : '');
}

function RoomPageInner() {
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [midPoint, setMidPoint] = useState<MidPoint | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const encoded = searchParams.get('r');
    if (encoded) {
      const decoded = decodeRoom(encoded);
      if (decoded) setRoom(decoded);
    }
  }, [searchParams]);

  const updateRoom = (updatedRoom: Room) => {
    setRoom(updatedRoom);
    const encoded = encodeRoom(updatedRoom);
    window.history.replaceState(null, '', `/room?r=${encoded}`);
  };

  const handleJoin = (participant: Participant) => {
    if (!room) return;
    const updated = { ...room, participants: [...room.participants, participant] };
    updateRoom(updated);
    setShowJoin(false);
  };

  const handleRemove = (id: string) => {
    if (!room) return;
    updateRoom({ ...room, participants: room.participants.filter((p) => p.id !== id) });
    setMidPoint(null);
    setPlaces([]);
  };

  const handleFindMidpoint = async () => {
    if (!room || room.participants.length < 2) {
      alert('최소 2명이 참여해야 해요.');
      return;
    }
    setIsLoading(true);
    try {
      const mp = await calcMidpoint(room.participants);
      const pl = await searchNearbyPlaces(mp);
      setMidPoint(mp);
      setPlaces(pl);
    } catch (err) {
      alert(err instanceof Error ? err.message : '중간 지점을 찾지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast('링크가 복사됐어요!');
      setTimeout(() => setToast(''), 2500);
    } catch {
      alert('링크 복사 실패. URL을 직접 복사해주세요.');
    }
  };

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500">약속 정보를 불러올 수 없어요.</p>
          <Link href="/create" className="mt-4 inline-block text-sm text-brand-600 underline">
            새 약속 만들기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest text-brand-600">FROMISE</p>
          <Link href="/create" className="text-xs text-slate-400 underline">새 약속</Link>
        </div>

        {/* Appointment card */}
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 p-6 text-white shadow-soft">
          <p className="text-sm font-medium text-white/70">약속</p>
          <h1 className="mt-1 text-2xl font-bold">{room.title}</h1>
          {(room.date || room.time) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/85">
              <CalendarDays className="h-4 w-4 shrink-0" />
              {formatDate(room.date, room.time)}
            </div>
          )}
        </section>

        {/* Invite section */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">참여자</h2>
                <p className="text-xs text-slate-500">{room.participants.length}/10명 참여 중</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              <Link2 className="h-3.5 w-3.5" />
              초대 링크
            </button>
          </div>

          {/* Participant list */}
          <div className="space-y-2">
            {room.participants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
                아직 참여자가 없어요. 링크를 공유하세요!
              </div>
            ) : (
              room.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {TRANSPORT_ICONS[p.transport]} {p.name}
                      <span className="ml-1.5 text-xs text-slate-400">{TRANSPORT_LABELS[p.transport]}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{p.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id)}
                    className="ml-2 shrink-0 rounded-full p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add myself */}
          {room.participants.length < 10 && (
            <div className="mt-3">
              {showJoin ? (
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-brand-700">참여자 직접 추가</p>
                  <JoinForm existingCount={room.participants.length} onJoin={handleJoin} />
                  <button
                    type="button"
                    onClick={() => setShowJoin(false)}
                    className="mt-2 w-full rounded-xl py-2 text-sm text-slate-400 hover:text-slate-600"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowJoin(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-white py-3 text-sm font-medium text-brand-600 hover:bg-brand-50"
                >
                  <UserPlus className="h-4 w-4" />
                  직접 입력하기
                </button>
              )}
            </div>
          )}
        </section>

        {/* Find midpoint */}
        <button
          type="button"
          onClick={handleFindMidpoint}
          disabled={isLoading || room.participants.length < 2}
          className="button-primary min-h-14 justify-center text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? '중간 지점 계산 중...' : '🗺️ 중간 지점 찾기'}
        </button>

        {midPoint && (
          <>
            <MapDisplay participants={room.participants} midPoint={midPoint} />
            <ResultSummary participants={room.participants} midPoint={midPoint} />
            <PlaceList places={places} />
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-400">로딩 중...</div>}>
      <RoomPageInner />
    </Suspense>
  );
}
