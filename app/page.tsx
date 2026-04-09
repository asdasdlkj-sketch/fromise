import Link from 'next/link';
import { MapPin, Users, Navigation } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.3em] text-brand-600">FROMISE</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900">
            우리 사이의
            <br />
            딱 좋은 만남 지점
          </h1>
          <p className="mt-4 text-base text-slate-500">
            각자의 출발지와 이동수단을 입력하면<br />
            가장 공평한 중간 장소를 추천해드려요.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: <MapPin className="h-3.5 w-3.5" />, label: '정확한 주소 검색' },
            { icon: <Users className="h-3.5 w-3.5" />, label: '친구 링크 초대' },
            { icon: <Navigation className="h-3.5 w-3.5" />, label: '이동수단별 공정 계산' },
          ].map((f) => (
            <span key={f.label} className="badge inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              {f.icon}{f.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/create"
          className="button-primary w-full justify-center py-4 text-lg"
        >
          약속 만들기
        </Link>

        {/* How it works */}
        <div className="w-full rounded-[28px] border border-slate-100 bg-white/80 p-5 shadow-soft">
          <p className="mb-4 text-sm font-semibold text-slate-700">이렇게 사용해요</p>
          <ol className="space-y-3">
            {[
              '약속 이름, 날짜, 시간을 설정해요',
              '링크를 친구들에게 공유해요',
              '각자 출발지와 이동수단을 입력해요',
              '최적의 중간 장소를 확인해요 🗺️',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
