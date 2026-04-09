'use client';

import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ensurePostcodeScript, geocodeAddress } from '@/lib/kakao';
import { Participant, TransportMode } from '@/types';

interface JoinFormProps {
  existingCount: number;
  onJoin: (participant: Participant) => void;
}

const TRANSPORT_OPTIONS: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'walk', label: '도보', icon: '🚶' },
  { value: 'transit', label: '대중교통', icon: '🚇' },
  { value: 'car', label: '자동차', icon: '🚗' }
];

export default function JoinForm({ existingCount, onJoin }: JoinFormProps) {
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<TransportMode>('transit');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    ensurePostcodeScript().catch(() => null);
  }, []);

  const handleSearch = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (isSearching) return;
    setIsSearching(true);

    try {
      await ensurePostcodeScript();
      if (!window.daum?.Postcode) throw new Error('주소 검색을 불러오지 못했습니다.');

      const selectedTransport = transport;
      const displayName = name.trim();

      new window.daum.Postcode({
        oncomplete: async (data: any) => {
          try {
            const address = data.roadAddress || data.jibunAddress || data.address;
            const coords = await geocodeAddress(address);
            onJoin({
              id: crypto.randomUUID(),
              name: displayName,
              address,
              lat: coords.lat,
              lng: coords.lng,
              transport: selectedTransport
            });
            setName('');
            setTransport('transit');
          } catch (err) {
            alert(err instanceof Error ? err.message : '주소 처리 오류');
          } finally {
            setIsSearching(false);
          }
        },
        onclose: () => setIsSearching(false)
      }).open();
    } catch (err) {
      setIsSearching(false);
      alert(err instanceof Error ? err.message : '주소 검색 오류');
    }
  };

  return (
    <div className="space-y-3">
      <input
        className="input"
        placeholder="내 이름 (예: 김민준)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
      />

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
        onClick={handleSearch}
        disabled={isSearching || existingCount >= 10}
        className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSearching ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> 주소 찾는 중</>
        ) : (
          <><Plus className="h-4 w-4" /> 출발지 검색 후 참여</>
        )}
      </button>
    </div>
  );
}
