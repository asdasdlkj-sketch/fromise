import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'fromise',
  description: '카카오맵 기반 중간 지점 추천 서비스'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
