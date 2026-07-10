// ============================================================
// 🔲 Cell.tsx - 개별 셀 컴포넌트
// ============================================================
// 게임 보드의 각 칸을 나타내는 컴포넌트입니다.
// O는 시안 네온 원형, X는 마젠타 네온 크로스로 표시됩니다.
// SVG 애니메이션으로 마크가 그려지는 효과를 제공합니다.

'use client';

import styles from './Cell.module.css';

// ----------------------------------------------------------
// 📦 Props 타입 정의
// ----------------------------------------------------------

interface CellProps {
  /** 이 칸의 값: 'O', 'X', 또는 비어있음(null) */
  value: 'O' | 'X' | null;
  /** 셀 클릭 시 호출되는 콜백 함수 */
  onClick: () => void;
  /** 이 셀이 승리 라인에 포함되는지 여부 */
  isWinning: boolean;
  /** 셀 클릭 불가 여부 (게임 종료 또는 이미 채워진 칸) */
  disabled: boolean;
}

// ----------------------------------------------------------
// 🏗️ 컴포넌트 본체
// ----------------------------------------------------------

export default function Cell({ value, onClick, isWinning, disabled }: CellProps) {
  // 셀에 적용할 CSS 클래스 조합
  const cellClasses = [
    styles.cell,                                    // 기본 셀 스타일
    value === 'O' ? styles.cellO : '',              // O 마크 스타일
    value === 'X' ? styles.cellX : '',              // X 마크 스타일
    isWinning ? styles.winning : '',                // 승리 라인 반짝임
    (disabled || value !== null) ? styles.disabled : '', // 클릭 불가 상태
  ]
    .filter(Boolean)  // 빈 문자열 제거
    .join(' ');       // 공백으로 합치기

  return (
    <div className={cellClasses} onClick={disabled || value !== null ? undefined : onClick}>
      {/* O 마크: SVG 원형 */}
      {value === 'O' && (
        <div className={styles.mark}>
          <svg className={styles.svgO} viewBox="0 0 80 80" width="100%" height="100%">
            {/* cx, cy: 원의 중심 좌표, r: 반지름 */}
            <circle cx="40" cy="40" r="30" />
          </svg>
        </div>
      )}

      {/* X 마크: SVG 크로스(두 개의 대각선) */}
      {value === 'X' && (
        <div className={styles.mark}>
          <svg className={styles.svgX} viewBox="0 0 80 80" width="100%" height="100%">
            {/* 왼쪽 위 → 오른쪽 아래 대각선 */}
            <line x1="18" y1="18" x2="62" y2="62" />
            {/* 오른쪽 위 → 왼쪽 아래 대각선 */}
            <line x1="62" y1="18" x2="18" y2="62" />
          </svg>
        </div>
      )}
    </div>
  );
}
