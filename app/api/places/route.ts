import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');
  const category = request.nextUrl.searchParams.get('category') || 'FD6';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=${lng}&y=${lat}&radius=1000&sort=distance`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  );

  if (!res.ok) {
    return NextResponse.json([], { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json(data.documents || []);
}
