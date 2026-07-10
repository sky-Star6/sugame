// ============================================================
// 🏆 ScoreBoard.tsx - 전적 표시 컴포넌트
// ============================================================
// O 승리, X 승리, 무승부 횟수를 네온 숫자로 표시합니다.
// AI 모드에서는 '나'와 'AI' 라벨로 구분합니다.

'use client';

import styles from './ScoreBoard.module.css';

// ----------------------------------------------------------
// 📦 Props 타입 정의
// ----------------------------------------------------------

interface ScoreBoardProps {
  /** 전적 기록: O 승리, X 승리, 무승부 횟수 */
  scores: { O: number; X: number; draw: number };
  /** 게임 모드 */
  gameMode: 'ai' | 'local';
  /** AI 모드에서 사용자의 마크 */
  playerMark: 'O' | 'X';
}

// ----------------------------------------------------------
// 🏗️ 컴포넌트 본체
// ----------------------------------------------------------

export default function ScoreBoard({ scores, gameMode, playerMark }: ScoreBoardProps) {
  /**
   * O/X에 표시할 라벨을 결정합니다.
   * 로컬 모드: 'O', 'X'
   * AI 모드: 사용자 마크이면 '나(O)' 또는 '나(X)', AI이면 'AI(O)' 또는 'AI(X)'
   */
  const getLabel = (mark: 'O' | 'X'): string => {
    if (gameMode === 'local') return mark;
    return mark === playerMark ? `나(${mark})` : `AI(${mark})`;
  };

  return (
    <div className={styles.container}>
      {/* O 전적 */}
      <div className={styles.scoreBox}>
        <span className={`${styles.scoreNumber} ${styles.scoreO}`}>
          {scores.O}
        </span>
        <span className={styles.scoreLabel}>{getLabel('O')}</span>
      </div>

      {/* 무승부 전적 */}
      <div className={styles.scoreBox}>
        <span className={`${styles.scoreNumber} ${styles.scoreDraw}`}>
          {scores.draw}
        </span>
        <span className={styles.scoreLabel}>무승부</span>
      </div>

      {/* X 전적 */}
      <div className={styles.scoreBox}>
        <span className={`${styles.scoreNumber} ${styles.scoreX}`}>
          {scores.X}
        </span>
        <span className={styles.scoreLabel}>{getLabel('X')}</span>
      </div>
    </div>
  );
}
