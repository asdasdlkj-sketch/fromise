'use client';

import { Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ensurePostcodeScript, geocodeAddress } from '@/lib/kakao';
import { Participant, TransportMode } from '@/types';

interface AddressInputProps {
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
}

const TRANSPORT_OPTIONS: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'walk', label: '도보', icon: '🚶' },
  { value: 'transit', label: '대중교통', icon: '🚇' },
  { value: 'car', label: '자동차', icon: '🚗' }
];

export default function AddressInput({ participants, onChange }: AddressInputProps) {
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<TransportMode>('transit');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    ensurePostcodeScript().catch(() => null);
  }, []);

  const nextDefaultName = useMemo(
    () => `참여자 ${participants.length + 1}`,
    [participants.length]
  );

  const handleSearchAddress = async () => {
    if (participants.length >= 10 || isSearching) return;

    setIsSearching(true);

    try {
      await ensurePostcodeScript();

      if (!window.daum?.Postcode) {
        throw new Error('주소 검색 스크립트를 불러오지 못했습니다.');
      }

      const displayName = name.trim() || nextDefaultName;
      const selectedTransport = transport;

      new window.daum.Postcode({
        oncomplete: async (data: any) => {
          try {
            const address = data.roadAddress || data.jibunAddress || data.address;
            const coords = await geocodeAddress(address);

            onChange([
              ...participants,
              {
                id: crypto.randomUUID(),
                name: displayName,
                address,
                lat: coords.lat,
                lng: coords.lng,
                transport: selectedTransport
              }
            ]);

            setName('');
            setTransport('transit');
          } catch (error) {
            alert(error instanceof Error ? error.message : '주소 처리 중 오류가 발생했습니다.');
          } finally {
            setIsSearching(false);
          }
        },
        onclose: () => {
          setIsSearching(false);
        }
      }).open();
    } catch (error) {
      setIsSearching(false);
      alert(error instanceof Error ? error.message : '주소 검색을 시작하지 못했습니다.');
    }
  };

  const handleRemove = (id: string) => {
    onChange(participants.filter((p) => p.id !== id));
  };

  const transportLabel = (t: TransportMode) => TRANSPORT_OPTIONS.find((o) => o.value === t)!;

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">출발지 입력</h2>
          <p className="text-sm text-slate-500">최대 10명까지 주소를 등록할 수 있어요.</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          className="input"
          placeholder={nextDefaultName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />

        {/* Transport mode selector */}
        <div className="flex gap-2">
          {TRANSPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTransport(opt.value)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-2xl border py-2.5 text-sm font-medium transition ${
                transport === opt.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSearchAddress}
          disabled={participants.length >= 10 || isSearching}
          className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              주소 찾는 중
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              주소 검색으로 참여자 추가
            </>
          )}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {participants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            아직 등록된 참여자가 없습니다.
          </div>
        ) : (
          participants.map((participant) => {
            const opt = transportLabel(participant.transport);
            return (
              <div
                key={participant.id}
                className="flex items-start justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {participant.name}
                    <span className="ml-2 text-sm text-slate-400">{opt.icon} {opt.label}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{participant.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(participant.id)}
                  className="ml-3 rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label={`${participant.name} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
