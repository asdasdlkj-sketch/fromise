# 🗺️ fromise — 약속 장소 중간지점 추천 서비스

> Find the fairest meeting point for everyone in your group.

**[🚀 Live Demo](https://fromise.vercel.app)**

![fromise](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## ✨ 주요 기능 / Features

| 기능 | 설명 |
|------|------|
| 📅 약속 생성 | 약속 이름, 날짜, 시간 설정 |
| 🔗 링크 초대 | 링크 공유로 친구가 직접 출발지 입력 |
| 🚶🚇🚗 이동수단 선택 | 도보 / 대중교통 / 자동차 개별 설정 |
| 📍 공정한 중간지점 계산 | 이동시간 분산 최소화 알고리즘 |
| 🚇 실시간 대중교통 시간 | ODSAY API 연동 (환승 포함 실제 소요시간) |
| 🗺️ 지도 시각화 | 출발지·중간지점 마커 + 경로선 표시 |
| 🍽️ 주변 장소 추천 | 맛집 / 카페 탭별 정렬, 카카오맵 연결 |
| 👆 경로 확인 | 참여자 클릭 시 카카오맵 경로 앱으로 연결 |
| 👥 최대 10명 | 소규모부터 대규모 모임까지 지원 |

---

## 📱 스크린샷 / Screenshots

```
랜딩 → 약속 생성 → 참여자 초대 → 중간지점 결과
  ↓         ↓            ↓              ↓
약속 이름  날짜·시간   링크 공유     지도 + 소요시간
설정      설정        직접 입력     맛집·카페 추천
```

---

## 🛠️ 기술 스택 / Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Leaflet.js + CartoDB tiles
- **APIs**:
  - [Kakao Local API](https://developers.kakao.com) — 주소 검색, 지하철역 탐색, 장소 검색
  - [ODSAY API](https://lab.odsay.com) — 대중교통 실제 소요시간
  - Daum Postcode — 주소 자동완성
- **Deploy**: Vercel

---

## ⚙️ 중간지점 계산 알고리즘

1. 모든 참여자의 좌표 **무게중심(Centroid)** 계산
2. 반경 5km 내 **지하철역 후보 10곳** 검색
3. 각 후보에 대해 이동수단별 소요시간 계산
   - 대중교통: ODSAY API 실시간 경로 (환승 포함)
   - 도보: 직선거리 ÷ 4km/h
   - 자동차: 직선거리 ÷ 22km/h
4. **최대 소요시간 + 분산 × 0.5** 로 공정도 점수 산출
5. **가장 낮은 점수** = 가장 공평한 만남 장소 선정

---

## 🚀 로컬 실행 / Getting Started

### 1. 클론

```bash
git clone https://github.com/asdasdlkj-sketch/fromise.git
cd fromise
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 아래 값을 채워주세요:

```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=  # Kakao JavaScript 키
KAKAO_REST_API_KEY=             # Kakao REST API 키
ODSAY_API_KEY=                  # ODSAY API 키 (대중교통 소요시간)
```

| 키 | 발급처 |
|----|--------|
| Kakao JS + REST | [developers.kakao.com](https://developers.kakao.com) → 앱 생성 → 앱 키 |
| ODSAY | [lab.odsay.com](https://lab.odsay.com) → 앱 등록 |

> Kakao 앱 설정에서 **카카오맵 서비스** 활성화 및 **Web 플랫폼**에 `http://localhost:3000` 등록 필요

### 3. 실행

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 프로젝트 구조

```
fromise/
├── app/
│   ├── page.tsx              # 랜딩 페이지
│   ├── create/page.tsx       # 약속 생성
│   ├── room/page.tsx         # 약속 방 (초대 + 결과)
│   └── api/
│       ├── geocode/          # 주소 → 좌표 변환
│       ├── midpoint/         # 공정 중간지점 계산
│       └── places/           # 주변 장소 검색
├── components/
│   ├── JoinForm.tsx          # 참여자 출발지 입력
│   ├── MapDisplay.tsx        # Leaflet 지도
│   ├── PlaceList.tsx         # 맛집·카페 목록
│   └── ResultSummary.tsx     # 소요시간 요약
├── lib/
│   ├── kakao.ts              # Kakao API 클라이언트
│   └── room.ts               # URL 상태 인코딩
└── types/index.ts            # TypeScript 타입 정의
```

---

## 🌐 배포 / Deployment

Vercel에 원클릭 배포:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/asdasdlkj-sketch/fromise)

배포 후 Vercel 대시보드 → Settings → Environment Variables에서 위 환경변수 3개를 추가해주세요.

---

## 📄 라이선스 / License

MIT
