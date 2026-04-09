'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { encodeRoom } from '@/lib/room';

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleCreate = () => {
    if (!title.trim()) {
      alert('약속 이름을 입력해주세요.');
      return;
    }

    const room = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      time,
      participants: []
    };

    const encoded = encodeRoom(room);
    router.push(`/room?r=${encoded}`);
  };

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-600">FROMISE</p>
            <h1 className="text-xl font-bold text-slate-900">약속 만들기</h1>
          </div>
        </div>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">약속 정보 입력</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                약속 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                className="input"
                placeholder="예: 홍대 저녁 모임"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={30}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">날짜</label>
              <input
                type="date"
                className="input"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">시간</label>
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleCreate}
          className="button-primary min-h-14 justify-center text-base"
        >
          다음 — 친구 초대하기
        </button>
      </div>
    </main>
  );
}
