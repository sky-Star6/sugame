// ============================================================
// 📄 page.tsx - 메인 게임 페이지
// ============================================================
// O/X 틱택토 게임의 전체 흐름을 관리하는 메인 페이지입니다.
// 1) 모드 선택 화면 → 2) 게임 플레이 → 3) 결과 확인 → 반복
//
// 주요 상태(State):
// - gameConfig: 게임 설정 (모드, 보드크기, 난이도, 선공)
// - board: 보드 상태 배열
// - currentPlayer: 현재 차례
// - gameResult: 승리/무승부 판정 결과
// - scores: 전적 기록

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createEmptyBoard,
  checkGameResult,
  getOpponent,
  type BoardState,
  type BoardSize,
  type Player,
} from '@/lib/gameLogic';
import { getAiMove, type Difficulty } from '@/lib/ai';
import { soundEngine } from '@/lib/sounds';
import ModeSelector, { type GameConfig } from '@/components/ModeSelector';
import Board from '@/components/Board';
import GameStatus from '@/components/GameStatus';
import ScoreBoard from '@/components/ScoreBoard';
import styles from './page.module.css';

// ----------------------------------------------------------
// 📦 타입 정의
// ----------------------------------------------------------

/** 전적 기록 타입 */
interface Scores {
  O: number;
  X: number;
  draw: number;
}

// ----------------------------------------------------------
// 🏗️ 메인 페이지 컴포넌트
// ----------------------------------------------------------

export default function Home() {
  // ==============================
  // 🎛️ 상태(State) 관리
  // ==============================

  /** 게임 설정: null이면 모드 선택 화면을 표시 */
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  /** 보드 상태 배열: 각 칸의 O/X/null 값 */
  const [board, setBoard] = useState<BoardState>([]);

  /** 현재 차례: 항상 'O'부터 시작 */
  const [currentPlayer, setCurrentPlayer] = useState<'O' | 'X'>('O');

  /** 승자: null이면 아직 결정 안 됨 */
  const [winner, setWinner] = useState<Player>(null);

  /** 승리 라인: 하이라이트할 셀 인덱스 배열 */
  const [winningLine, setWinningLine] = useState<number[]>([]);

  /** 무승부 여부 */
  const [isDraw, setIsDraw] = useState(false);

  /** 게임 진행 중 여부 (false면 게임 종료) */
  const [gameActive, setGameActive] = useState(false);

  /** AI가 수를 계산 중인지 여부 */
  const [isAiThinking, setIsAiThinking] = useState(false);

  /** 전적 기록 */
  const [scores, setScores] = useState<Scores>({ O: 0, X: 0, draw: 0 });

  /** 음소거 상태 */
  const [isMuted, setIsMuted] = useState(false);

  /** AI 타이머 참조 (클린업용) */
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==============================
  // 🎮 게임 시작
  // ==============================

  /**
   * 모드 선택 후 게임을 시작합니다.
   * 보드를 초기화하고, AI 모드에서 AI가 선공이면 첫 수를 둡니다.
   */
  const handleStartGame = useCallback((config: GameConfig) => {
    setGameConfig(config);
    const emptyBoard = createEmptyBoard(config.boardSize);
    setBoard(emptyBoard);
    setCurrentPlayer('O');   // O가 항상 선공
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setGameActive(true);
    setIsAiThinking(false);
    soundEngine.playStart();
  }, []);

  // ==============================
  // 🤖 AI 턴 처리
  // ==============================

  /**
   * AI의 차례일 때 자동으로 수를 계산하여 놓습니다.
   * useEffect로 currentPlayer가 바뀔 때마다 체크합니다.
   */
  useEffect(() => {
    // AI 모드가 아니거나, 게임이 끝났거나, 사용자 차례면 아무것도 안 함
    if (!gameConfig || gameConfig.mode !== 'ai' || !gameActive) return;

    const aiMark = getOpponent(gameConfig.playerMark);

    // 현재 차례가 AI가 아니면 스킵
    if (currentPlayer !== aiMark) return;

    setIsAiThinking(true);

    // 약간의 딜레이를 줘서 AI가 "생각하는" 느낌을 줌 (500ms)
    aiTimerRef.current = setTimeout(() => {
      const aiMove = getAiMove(board, gameConfig.boardSize, aiMark, gameConfig.difficulty);

      if (aiMove !== -1) {
        // AI의 수를 보드에 반영
        const newBoard = [...board];
        newBoard[aiMove] = aiMark;
        setBoard(newBoard);

        // AI 배치 효과음
        soundEngine.playAiPlace();

        // 게임 결과 판정
        const result = checkGameResult(newBoard, gameConfig.boardSize);

        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.winningLine);
          setGameActive(false);
          setScores((prev) => ({ ...prev, [result.winner!]: prev[result.winner!] + 1 }));
          // 짧은 딜레이 후 승리 효과음 (UI 업데이트 후)
          setTimeout(() => soundEngine.playWin(), 200);
        } else if (result.isDraw) {
          setIsDraw(true);
          setGameActive(false);
          setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
          setTimeout(() => soundEngine.playDraw(), 200);
        } else {
          // 다음 턴으로 넘김
          setCurrentPlayer(getOpponent(aiMark));
        }
      }

      setIsAiThinking(false);
    }, 500);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, [currentPlayer, board, gameActive, gameConfig]);

  // ==============================
  // 🖱️ 셀 클릭 처리
  // ==============================

  /**
   * 사용자가 셀을 클릭했을 때 호출됩니다.
   * 해당 칸에 현재 플레이어의 마크를 놓고, 게임 결과를 판정합니다.
   */
  const handleCellClick = useCallback(
    (index: number) => {
      // 게임이 끝났거나, 이미 채워진 칸이거나, AI 턴이면 무시
      if (!gameActive || board[index] !== null || isAiThinking || !gameConfig) {
        // 이미 채워진 칸을 클릭하면 경고음
        if (board[index] !== null && gameActive) {
          soundEngine.playInvalid();
        }
        return;
      }

      // AI 모드에서 AI 차례에 클릭하면 무시
      if (gameConfig.mode === 'ai') {
        const aiMark = getOpponent(gameConfig.playerMark);
        if (currentPlayer === aiMark) return;
      }

      // 보드에 마크 놓기
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      // 배치 효과음
      soundEngine.playPlace();

      // 게임 결과 판정
      const result = checkGameResult(newBoard, gameConfig.boardSize);

      if (result.winner) {
        // 승리!
        setWinner(result.winner);
        setWinningLine(result.winningLine);
        setGameActive(false);
        setScores((prev) => ({ ...prev, [result.winner!]: prev[result.winner!] + 1 }));
        setTimeout(() => soundEngine.playWin(), 200);
      } else if (result.isDraw) {
        // 무승부!
        setIsDraw(true);
        setGameActive(false);
        setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
        setTimeout(() => soundEngine.playDraw(), 200);
      } else {
        // 다음 턴으로 넘김
        setCurrentPlayer(getOpponent(currentPlayer));
      }
    },
    [board, currentPlayer, gameActive, isAiThinking, gameConfig]
  );

  // ==============================
  // 🔄 게임 재시작
  // ==============================

  /**
   * 현재 설정을 유지하면서 게임만 재시작합니다.
   * 전적은 유지됩니다.
   */
  const handleRestart = useCallback(() => {
    if (!gameConfig) return;

    const emptyBoard = createEmptyBoard(gameConfig.boardSize);
    setBoard(emptyBoard);
    setCurrentPlayer('O');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setGameActive(true);
    setIsAiThinking(false);
    soundEngine.playStart();
  }, [gameConfig]);

  /**
   * 모드 선택 화면으로 돌아갑니다.
   * 전적은 초기화됩니다.
   */
  const handleBackToMenu = useCallback(() => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
    }
    setGameConfig(null);
    setScores({ O: 0, X: 0, draw: 0 });
  }, []);

  // ==============================
  // 🔇 음소거 토글
  // ==============================

  const handleToggleMute = useCallback(() => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  // ==============================
  // 🎨 렌더링
  // ==============================

  // 모드 선택 화면 (gameConfig이 null일 때)
  if (!gameConfig) {
    return (
      <main className={styles.main}>
        <ModeSelector onStartGame={handleStartGame} />
      </main>
    );
  }

  // 게임 플레이 화면
  const difficultyLabel =
    gameConfig.difficulty === 'easy' ? '쉬움' :
    gameConfig.difficulty === 'medium' ? '보통' : '어려움';

  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        {/* 🏷️ 게임 헤더: 제목 + 음소거 버튼 */}
        <div className={styles.gameHeader}>
          <h1 className={styles.gameTitle}>{gameConfig.boardSize === 15 ? 'O/X 오목' : 'O/X 틱택토'}</h1>
          <button
            className={styles.muteBtn}
            onClick={handleToggleMute}
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* 📋 모드 정보 태그 */}
        <div className={styles.modeInfo}>
          <span className={styles.tag}>
            {gameConfig.mode === 'ai' ? '🤖 AI 대전' : '👥 1:1 대전'}
          </span>
          <span className={styles.tag}>
            {gameConfig.boardSize === 15
              ? '15×15 오목 (5연속)'
              : `${gameConfig.boardSize}×${gameConfig.boardSize}`}
          </span>
          {gameConfig.mode === 'ai' && (
            <span className={styles.tag}>난이도: {difficultyLabel}</span>
          )}
        </div>

        {/* 🏆 전적 표시 */}
        <ScoreBoard
          scores={scores}
          gameMode={gameConfig.mode}
          playerMark={gameConfig.playerMark}
        />

        {/* 📊 게임 상태 표시 */}
        <GameStatus
          currentPlayer={currentPlayer}
          winner={winner}
          isDraw={isDraw}
          gameMode={gameConfig.mode}
          isAiThinking={isAiThinking}
          playerMark={gameConfig.playerMark}
        />

        {/* 🎯 게임 보드 */}
        <Board
          board={board}
          boardSize={gameConfig.boardSize}
          winningLine={winningLine}
          onCellClick={handleCellClick}
          disabled={!gameActive || isAiThinking}
        />

        {/* 🔘 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <button className={`${styles.btn} ${styles.restartBtn}`} onClick={handleRestart}>
            🔄 다시 시작
          </button>
          <button className={`${styles.btn} ${styles.settingsBtn}`} onClick={handleBackToMenu}>
            ⚙️ 설정 변경
          </button>
        </div>
      </div>
    </main>
  );
}
