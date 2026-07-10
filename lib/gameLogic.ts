// ============================================================
// 🎯 gameLogic.ts - 게임 핵심 로직 (승리 판정, 무승부 체크)
// ============================================================
// O/X 틱택토 게임의 핵심 규칙을 담당하는 모듈입니다.
// 보드 크기별 승리 조건:
// - 3×3: 3개 연속 (클래식 틱택토)
// - 5×5: 4개 연속 (확장 틱택토)
// - 15×15: 5개 연속 (오목)

// ----------------------------------------------------------
// 📦 타입 정의 (Type Definitions)
// ----------------------------------------------------------

/** 플레이어 타입: 'O', 'X', 또는 비어있는 칸(null) */
export type Player = 'O' | 'X' | null;

/** 보드 상태: 각 칸의 상태를 담는 1차원 배열 */
export type BoardState = Player[];

/** 보드 크기: 3×3, 5×5, 또는 15×15(오목) */
export type BoardSize = 3 | 5 | 15;

/** 게임 결과 타입 */
export interface GameResult {
  /** 승자: 'O', 'X', 또는 아직 결정되지 않음(null) */
  winner: Player;
  /** 승리한 라인의 셀 인덱스 배열 (하이라이트용) */
  winningLine: number[];
  /** 무승부 여부 */
  isDraw: boolean;
}

// ----------------------------------------------------------
// 🏆 승리 조건 매핑
// ----------------------------------------------------------
// 보드 크기별로 몇 개를 연속으로 놓아야 이기는지 정의합니다.

/** 보드 크기에 따른 승리에 필요한 연속 개수 */
const WIN_LENGTH_MAP: Record<BoardSize, number> = {
  3: 3,   // 3×3 보드: 3개 연속
  5: 4,   // 5×5 보드: 4개 연속
  15: 5,  // 15×15 보드(오목): 5개 연속
};

/**
 * 보드 크기에 맞는 승리 조건(연속 개수)을 반환합니다.
 *
 * @param size - 보드 크기
 * @returns 승리에 필요한 연속 개수
 */
export function getWinLength(size: BoardSize): number {
  return WIN_LENGTH_MAP[size];
}

// ----------------------------------------------------------
// 🏆 3×3 보드 승리 조합 (사전 정의)
// ----------------------------------------------------------
// 3×3 보드에서 가능한 8가지 승리 조합입니다.
// 각 배열은 [셀1, 셀2, 셀3]의 인덱스를 의미합니다.
//
// 보드 인덱스 배치:
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8

const WIN_COMBINATIONS_3X3: number[][] = [
  // 가로줄 3개
  [0, 1, 2],  // 첫 번째 행 (가로)
  [3, 4, 5],  // 두 번째 행 (가로)
  [6, 7, 8],  // 세 번째 행 (가로)
  // 세로줄 3개
  [0, 3, 6],  // 첫 번째 열 (세로)
  [1, 4, 7],  // 두 번째 열 (세로)
  [2, 5, 8],  // 세 번째 열 (세로)
  // 대각선 2개
  [0, 4, 8],  // 왼쪽 위 → 오른쪽 아래 대각선
  [2, 4, 6],  // 오른쪽 위 → 왼쪽 아래 대각선
];

// ----------------------------------------------------------
// 🏆 범용 승리 조합 생성 함수
// ----------------------------------------------------------

/**
 * 주어진 보드 크기와 승리 연속 개수로 모든 승리 조합을 동적으로 생성합니다.
 * 슬라이딩 윈도우 방식으로 4방향(가로, 세로, 대각선2)을 탐색합니다.
 *
 * @param boardSize - 보드 크기 (한 변의 길이)
 * @param winLength - 승리에 필요한 연속 개수
 * @returns 승리 조합 배열 (각 조합은 winLength개의 셀 인덱스)
 */
function generateWinCombinations(boardSize: number, winLength: number): number[][] {
  const combinations: number[][] = [];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // 가로(→): 현재 위치에서 오른쪽으로 winLength칸
      if (col + winLength <= boardSize) {
        const line: number[] = [];
        for (let k = 0; k < winLength; k++) {
          line.push(row * boardSize + (col + k));
        }
        combinations.push(line);
      }

      // 세로(↓): 현재 위치에서 아래로 winLength칸
      if (row + winLength <= boardSize) {
        const line: number[] = [];
        for (let k = 0; k < winLength; k++) {
          line.push((row + k) * boardSize + col);
        }
        combinations.push(line);
      }

      // 대각선(↘): 오른쪽 아래 방향으로 winLength칸
      if (row + winLength <= boardSize && col + winLength <= boardSize) {
        const line: number[] = [];
        for (let k = 0; k < winLength; k++) {
          line.push((row + k) * boardSize + (col + k));
        }
        combinations.push(line);
      }

      // 대각선(↗): 오른쪽 위 방향으로 winLength칸
      if (row - winLength + 1 >= 0 && col + winLength <= boardSize) {
        const line: number[] = [];
        for (let k = 0; k < winLength; k++) {
          line.push((row - k) * boardSize + (col + k));
        }
        combinations.push(line);
      }
    }
  }

  return combinations;
}

/** 5×5 보드의 모든 승리 조합 (4개 연속, 미리 계산하여 캐싱) */
const WIN_COMBINATIONS_5X5 = generateWinCombinations(5, 4);

/** 15×15 보드(오목)의 모든 승리 조합 (5개 연속, 미리 계산하여 캐싱) */
const WIN_COMBINATIONS_15X15 = generateWinCombinations(15, 5);

// ----------------------------------------------------------
// 📤 외부에서 사용하는 함수들 (Exported Functions)
// ----------------------------------------------------------

/**
 * 해당 보드 크기에 맞는 승리 조합 배열을 반환합니다.
 *
 * @param size - 보드 크기 (3, 5, 또는 15)
 * @returns 승리 조합 배열
 */
export function getWinCombinations(size: BoardSize): number[][] {
  if (size === 3) return WIN_COMBINATIONS_3X3;
  if (size === 5) return WIN_COMBINATIONS_5X5;
  return WIN_COMBINATIONS_15X15;
}

/**
 * 현재 보드 상태에서 게임 결과를 판정합니다.
 * 승리자가 있는지, 무승부인지, 아직 진행 중인지를 판단합니다.
 *
 * @param board - 현재 보드 상태 배열
 * @param size  - 보드 크기 (3 또는 5)
 * @returns 게임 결과 객체 (winner, winningLine, isDraw)
 */
export function checkGameResult(board: BoardState, size: BoardSize): GameResult {
  const combinations = getWinCombinations(size);

  // 모든 승리 조합을 순회하며 연속인지 확인
  for (const combo of combinations) {
    const firstCell = board[combo[0]];

    // 첫 번째 칸이 비어있으면 이 조합은 스킵
    if (firstCell === null) continue;

    // 조합의 모든 칸이 같은 플레이어인지 확인
    const isWin = combo.every((index) => board[index] === firstCell);

    if (isWin) {
      return {
        winner: firstCell,       // 승자 반환
        winningLine: combo,      // 승리 라인 인덱스
        isDraw: false,
      };
    }
  }

  // 승자가 없으면 무승부 체크: 빈 칸이 하나도 없으면 무승부
  const isDraw = board.every((cell) => cell !== null);

  return {
    winner: null,
    winningLine: [],
    isDraw,
  };
}

/**
 * 빈 보드를 생성합니다.
 *
 * @param size - 보드 크기 (3 또는 5)
 * @returns 모든 칸이 null인 새 보드 배열
 */
export function createEmptyBoard(size: BoardSize): BoardState {
  return Array(size * size).fill(null);
}

/**
 * 현재 플레이어의 상대 플레이어를 반환합니다.
 * O → X, X → O
 *
 * @param player - 현재 플레이어
 * @returns 상대 플레이어
 */
export function getOpponent(player: 'O' | 'X'): 'O' | 'X' {
  return player === 'O' ? 'X' : 'O';
}
