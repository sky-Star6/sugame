// ============================================================
// 📊 GameStatus.tsx - 게임 상태 표시 컴포넌트
// ============================================================
// 현재 누구 차례인지, 승리/무승부 메시지를 표시합니다.
// AI 모드에서는 "AI 생각 중..." 스피너도 보여줍니다.

'use client';

import styles from './GameStatus.module.css';

// ----------------------------------------------------------
// 📦 Props 타입 정의
// ----------------------------------------------------------

interface GameStatusProps {
  /** 현재 차례인 플레이어 ('O' 또는 'X') */
  currentPlayer: 'O' | 'X';
  /** 승자 (null이면 아직 승자 없음) */
  winner: 'O' | 'X' | null;
  /** 무승부 여부 */
  isDraw: boolean;
  /** 게임 모드 */
  gameMode: 'ai' | 'local';
  /** AI가 수를 계산 중인지 여부 */
  isAiThinking: boolean;
  /** AI 모드에서 사용자의 마크 */
  playerMark: 'O' | 'X';
}

// ----------------------------------------------------------
// 🏗️ 컴포넌트 본체
// ----------------------------------------------------------

export default function GameStatus({
  currentPlayer,
  winner,
  isDraw,
  gameMode,
  isAiThinking,
  playerMark,
}: GameStatusProps) {
  /**
   * 플레이어 이름을 반환합니다.
   * AI 모드: 사용자 마크이면 '나', AI 마크이면 'AI'
   * 로컬 모드: 'O' 또는 'X'
   */
  const getPlayerName = (mark: 'O' | 'X'): string => {
    if (gameMode === 'local') return mark;
    return mark === playerMark ? '나' : 'AI';
  };

  // 1️⃣ 승리 메시지
  if (winner) {
    const name = getPlayerName(winner);
    const winClass = winner === 'O' ? styles.winnerO : styles.winnerX;
    return (
      <div className={styles.container}>
        <span className={`${styles.status} ${styles.winner} ${winClass}`}>
          🎉 {name} 승리!
        </span>
      </div>
    );
  }

  // 2️⃣ 무승부 메시지
  if (isDraw) {
    return (
      <div className={styles.container}>
        <span className={`${styles.status} ${styles.draw}`}>
          🤝 무승부!
        </span>
      </div>
    );
  }

  // 3️⃣ AI 생각 중
  if (isAiThinking) {
    return (
      <div className={styles.container}>
        <span className={`${styles.status} ${styles.thinking}`}>
          <span className={styles.spinner}>🤖</span>
          AI 생각 중...
        </span>
      </div>
    );
  }

  // 4️⃣ 일반 턴 표시
  const name = getPlayerName(currentPlayer);
  const turnClass = currentPlayer === 'O' ? styles.turnO : styles.turnX;

  return (
    <div className={styles.container}>
      <span className={`${styles.status} ${turnClass}`}>
        {currentPlayer === 'O' ? '⭕' : '❌'} {name}의 차례
      </span>
    </div>
  );
}
