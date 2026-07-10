// ============================================================
// 🏠 layout.tsx - 루트 레이아웃 (앱 전체를 감싸는 껍데기)
// ============================================================
// Next.js App Router에서 가장 바깥쪽 레이아웃 파일입니다.
// 모든 페이지에 공통으로 적용되는 폰트, 메타데이터, 스타일을 설정합니다.

import type { Metadata } from 'next';
// Google Fonts: 한국어 + 영문 모던 폰트
import { Noto_Sans_KR, Outfit } from 'next/font/google';
// 글로벌 CSS (디자인 시스템) 불러오기
import './globals.css';

/**
 * Noto Sans KR 폰트 설정 (한국어 폰트)
 * - 게임 UI의 한국어 텍스트에 사용됩니다.
 */
const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

/**
 * Outfit 폰트 설정 (영문/숫자용 모던 폰트)
 * - O/X 마크, 숫자, 영문 텍스트에 사용됩니다.
 */
const outfit = Outfit({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

/**
 * 📝 페이지 메타데이터 설정
 * - 브라우저 탭 제목과 검색 엔진 설명
 */
export const metadata: Metadata = {
  title: '🎮 O/X 틱택토 - Tic-Tac-Toe',
  description:
    'AI와 대전하거나 친구와 함께 즐기는 O/X 틱택토 게임! 3×3, 5×5 보드를 지원합니다.',
};

/**
 * 📱 뷰포트(Viewport) 설정
 * - 모바일 기기에서 적절한 크기로 표시되도록 설정
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a1a',
};

/**
 * 🏗️ 루트 레이아웃 컴포넌트
 * 모든 페이지의 최상위 래퍼(wrapper) 역할을 합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className={notoSansKR.className}>{children}</body>
    </html>
  );
}
