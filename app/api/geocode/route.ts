import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Kakao API error' }, { status: 502 });
  }

  const data = await res.json();

  if (!data.documents?.[0]) {
    return NextResponse.json({ error: '주소를 찾을 수 없습니다' }, { status: 404 });
  }

  const doc = data.documents[0];
  return NextResponse.json({ lat: parseFloat(doc.y), lng: parseFloat(doc.x) });
}
