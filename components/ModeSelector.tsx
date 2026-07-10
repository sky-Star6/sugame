// ============================================================
// 🎮 ModeSelector.tsx - 게임 모드 선택 컴포넌트
// ============================================================
// 게임 시작 전에 모드, 보드 크기, 난이도를 선택하는 화면입니다.
// AI 대전 / 1:1 대전, 3×3 / 5×5, 쉬움/보통/어려움을 고를 수 있습니다.

'use client';

import { useState } from 'react';
import type { BoardSize } from '@/lib/gameLogic';
import type { Difficulty } from '@/lib/ai';
import styles from './ModeSelector.module.css';

// ----------------------------------------------------------
// 📦 Props 타입 정의
// ----------------------------------------------------------

/** 게임 시작 시 전달할 설정 */
export interface GameConfig {
  mode: 'ai' | 'local';          // 'ai': AI 대전, 'local': 1:1 대전
  boardSize: BoardSize;           // 보드 크기 (3 또는 5)
  difficulty: Difficulty;         // AI 난이도 (AI 모드에서만 사용)
  playerMark: 'O' | 'X';         // 사용자의 마크 (AI 모드에서만 사용)
}

interface ModeSelectorProps {
  /** 게임 시작 버튼 클릭 시 호출되는 콜백 함수 */
  onStartGame: (config: GameConfig) => void;
}

// ----------------------------------------------------------
// 🏗️ 컴포넌트 본체
// ----------------------------------------------------------

export default function ModeSelector({ onStartGame }: ModeSelectorProps) {
  // 🎮 게임 모드 상태: 'ai'(AI 대전) 또는 'local'(1:1 대전)
  const [mode, setMode] = useState<'ai' | 'local'>('ai');

  // 📐 보드 크기 상태: 3(3×3) 또는 5(5×5)
  const [boardSize, setBoardSize] = useState<BoardSize>(3);

  // 🤖 AI 난이도 상태 (AI 모드에서만 사용)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // 🔵 사용자 마크 상태: 'O'(선공) 또는 'X'(후공)
  const [playerMark, setPlayerMark] = useState<'O' | 'X'>('O');

  /**
   * "게임 시작" 버튼 클릭 핸들러
   * 현재 선택된 설정을 부모 컴포넌트로 전달합니다.
   */
  const handleStart = () => {
    onStartGame({ mode, boardSize, difficulty, playerMark });
  };

  return (
    <div className={styles.container}>
      {/* 🏷️ 게임 제목 */}
      <h1 className={styles.title}>🎮 O/X 틱택토</h1>
      <p className={styles.subtitle}>모드와 설정을 선택하고 게임을 시작하세요!</p>

      {/* 1️⃣ 게임 모드 선택 */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>게임 모드</span>
        <div className={styles.modeCards}>
          {/* AI 대전 카드 */}
          <div
            className={`${styles.modeCard} ${mode === 'ai' ? styles.modeCardActive : ''}`}
            onClick={() => setMode('ai')}
          >
            <span className={styles.modeIcon}>🤖</span>
            <span className={styles.modeName}>AI 대전</span>
            <span className={styles.modeDesc}>컴퓨터와 대전</span>
          </div>
          {/* 1:1 대전 카드 */}
          <div
            className={`${styles.modeCard} ${mode === 'local' ? styles.modeCardActive : ''}`}
            onClick={() => setMode('local')}
          >
            <span className={styles.modeIcon}>👥</span>
            <span className={styles.modeName}>1:1 대전</span>
            <span className={styles.modeDesc}>친구와 함께</span>
          </div>
        </div>
      </div>

      {/* 2️⃣ 보드 크기 선택 */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>보드 크기</span>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${boardSize === 3 ? styles.toggleBtnActive : ''}`}
            onClick={() => setBoardSize(3)}
          >
            3×3 (3연속)
          </button>
          <button
            className={`${styles.toggleBtn} ${boardSize === 5 ? styles.toggleBtnActive : ''}`}
            onClick={() => setBoardSize(5)}
          >
            5×5 (4연속)
          </button>
          <button
            className={`${styles.toggleBtn} ${boardSize === 15 ? styles.toggleBtnActive : ''}`}
            onClick={() => setBoardSize(15)}
          >
            15×15 오목
          </button>
        </div>
      </div>

      {/* 3️⃣ AI 난이도 선택 (AI 모드에서만 표시) */}
      {mode === 'ai' && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>AI 난이도</span>
          <div className={styles.difficultyGroup}>
            <button
              className={`${styles.difficultyBtn} ${difficulty === 'easy' ? styles.difficultyEasy : ''}`}
              onClick={() => setDifficulty('easy')}
            >
              😊 쉬움
            </button>
            <button
              className={`${styles.difficultyBtn} ${difficulty === 'medium' ? styles.difficultyMedium : ''}`}
              onClick={() => setDifficulty('medium')}
            >
              🧠 보통
            </button>
            <button
              className={`${styles.difficultyBtn} ${difficulty === 'hard' ? styles.difficultyHard : ''}`}
              onClick={() => setDifficulty('hard')}
            >
              💪 어려움
            </button>
          </div>
        </div>
      )}

      {/* 4️⃣ 선공/후공 선택 (AI 모드에서만 표시) */}
      {mode === 'ai' && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>선공 선택</span>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${playerMark === 'O' ? styles.toggleBtnActive : ''}`}
              onClick={() => setPlayerMark('O')}
            >
              ⭕ O (선공)
            </button>
            <button
              className={`${styles.toggleBtn} ${playerMark === 'X' ? styles.toggleBtnActive : ''}`}
              onClick={() => setPlayerMark('X')}
            >
              ❌ X (후공)
            </button>
          </div>
        </div>
      )}

      {/* 🚀 게임 시작 버튼 */}
      <button className={styles.startBtn} onClick={handleStart}>
        🎯 게임 시작!
      </button>
    </div>
  );
}
