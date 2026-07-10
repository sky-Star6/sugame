// ============================================================
// 🎯 Board.tsx - 게임 보드 컴포넌트
// ============================================================
// CSS Grid를 사용하여 3×3 또는 5×5 게임 보드를 렌더링합니다.
// 각 칸은 Cell 컴포넌트로 구성됩니다.

'use client';

import type { Player, BoardSize } from '@/lib/gameLogic';
import Cell from './Cell';
import styles from './Board.module.css';

// ----------------------------------------------------------
// 📦 Props 타입 정의
// ----------------------------------------------------------

interface BoardProps {
  /** 보드 상태 배열 (각 칸의 O/X/null 값) */
  board: Player[];
  /** 보드 크기 (3 또는 5) */
  boardSize: BoardSize;
  /** 승리 라인의 셀 인덱스 배열 (하이라이트용) */
  winningLine: number[];
  /** 셀 클릭 시 호출되는 콜백 함수 (인덱스 전달) */
  onCellClick: (index: number) => void;
  /** 보드 전체 클릭 불가 여부 */
  disabled: boolean;
}

// ----------------------------------------------------------
// 🏗️ 컴포넌트 본체
// ----------------------------------------------------------

export default function Board({
  board,
  boardSize,
  winningLine,
  onCellClick,
  disabled,
}: BoardProps) {
  // 보드 크기에 따른 CSS 클래스
  const sizeClass =
    boardSize === 3 ? styles.board3 :
    boardSize === 5 ? styles.board5 :
    styles.board15;
  const boardClass = `${styles.board} ${sizeClass}`;

  return (
    <div
      className={boardClass}
      style={{
        // 보드 크기에 맞게 CSS Grid 열(column) 개수를 동적으로 설정
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {/* 보드 배열을 순회하며 각 칸에 Cell 컴포넌트를 렌더링 */}
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          value={cellValue}
          onClick={() => onCellClick(index)}
          isWinning={winningLine.includes(index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
