// ============================================================
// 🤖 ai.ts - AI 엔진 (미니맥스 알고리즘)
// ============================================================
// 컴퓨터가 O/X를 어디에 놓을지 결정하는 인공지능(AI) 모듈입니다.
// 3가지 난이도를 제공합니다:
// - 쉬움(Easy): 무작위로 빈 칸에 놓기
// - 보통(Medium): 기본 전략 (이기는 수 → 막는 수 → 좋은 위치)
// - 어려움(Hard): 미니맥스(Minimax) 알고리즘으로 최적의 수 찾기

import {
  BoardState,
  BoardSize,
  Player,
  checkGameResult,
  getWinCombinations,
  getWinLength,
  getOpponent,
} from './gameLogic';

/** AI 난이도 타입 */
export type Difficulty = 'easy' | 'medium' | 'hard';

// ----------------------------------------------------------
// 📤 메인 함수: AI가 둘 위치를 결정
// ----------------------------------------------------------

/**
 * AI가 다음에 놓을 위치(인덱스)를 반환합니다.
 *
 * @param board      - 현재 보드 상태
 * @param size       - 보드 크기 (3 또는 5)
 * @param aiPlayer   - AI가 사용하는 마크 ('O' 또는 'X')
 * @param difficulty - 난이도 ('easy' | 'medium' | 'hard')
 * @returns 놓을 위치의 인덱스 (0부터 시작), 놓을 곳이 없으면 -1
 */
export function getAiMove(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X',
  difficulty: Difficulty
): number {
  // 빈 칸 목록 구하기
  const emptyCells = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);

  // 빈 칸이 없으면 놓을 곳이 없음
  if (emptyCells.length === 0) return -1;

  // 15×15 오목은 보드가 너무 커서 별도의 전략 사용
  if (size === 15) {
    return getGomokuMove(board, size, aiPlayer, difficulty, emptyCells);
  }

  // 3×3, 5×5는 난이도에 따라 다른 전략 사용
  switch (difficulty) {
    case 'easy':
      return getEasyMove(emptyCells);
    case 'medium':
      return getMediumMove(board, size, aiPlayer, emptyCells);
    case 'hard':
      return getHardMove(board, size, aiPlayer);
    default:
      return getEasyMove(emptyCells);
  }
}

// ----------------------------------------------------------
// 😊 쉬운 난이도: 무작위 선택
// ----------------------------------------------------------

/**
 * 빈 칸 중 무작위로 하나를 선택합니다.
 * 전략 없이 아무 곳이나 놓으므로 초보자도 이길 수 있습니다.
 *
 * @param emptyCells - 빈 칸 인덱스 배열
 * @returns 무작위로 선택된 셀 인덱스
 */
function getEasyMove(emptyCells: number[]): number {
  // Math.random()으로 0~1 사이 랜덤 값 생성 → 빈 칸 배열 길이로 곱해 인덱스 선택
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

// ----------------------------------------------------------
// 🧠 보통 난이도: 규칙 기반 전략
// ----------------------------------------------------------

/**
 * 간단한 규칙(Rule)을 순서대로 적용하여 수를 결정합니다.
 * 우선순위: 이기는 수 → 막는 수 → 중앙 → 모서리 → 나머지
 *
 * @param board      - 현재 보드 상태
 * @param size       - 보드 크기
 * @param aiPlayer   - AI의 마크
 * @param emptyCells - 빈 칸 인덱스 배열
 * @returns 선택된 셀 인덱스
 */
function getMediumMove(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X',
  emptyCells: number[]
): number {
  const humanPlayer = getOpponent(aiPlayer);

  // 1️⃣ 이기는 수(Winning Move): AI가 놓으면 바로 이기는 위치 찾기
  const winMove = findWinningMove(board, size, aiPlayer);
  if (winMove !== -1) return winMove;

  // 2️⃣ 막는 수(Blocking Move): 상대가 놓으면 이기는 위치를 미리 차단
  const blockMove = findWinningMove(board, size, humanPlayer);
  if (blockMove !== -1) return blockMove;

  // 3️⃣ 중앙 차지: 중앙은 전략적으로 가장 유리한 위치
  const center = Math.floor(size / 2) * size + Math.floor(size / 2);
  if (board[center] === null) return center;

  // 4️⃣ 모서리(Corner) 차지: 대각선 공격에 유리
  const corners = getCorners(size);
  const emptyCorners = corners.filter((i) => board[i] === null);
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }

  // 5️⃣ 나머지 빈 칸 중 무작위 선택
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

/**
 * 특정 플레이어가 놓으면 바로 이기는 위치를 찾습니다.
 *
 * @param board  - 현재 보드 상태
 * @param size   - 보드 크기
 * @param player - 확인할 플레이어
 * @returns 이기는 위치 인덱스, 없으면 -1
 */
function findWinningMove(
  board: BoardState,
  size: BoardSize,
  player: Player
): number {
  const combinations = getWinCombinations(size);

  // 승리에 필요한 연속 개수 (3×3은 3개, 5×5는 4개)
  const winLength = getWinLength(size);

  for (const combo of combinations) {
    // 이 조합에서 해당 플레이어의 마크가 몇 개 있는지 세기
    const playerCount = combo.filter((i) => board[i] === player).length;
    // 빈 칸이 몇 개 있는지 세기
    const emptyCount = combo.filter((i) => board[i] === null).length;

    // (winLength-1)개가 채워져 있고 1개가 비어있으면 → 놓으면 바로 이김!
    if (playerCount === winLength - 1 && emptyCount === 1) {
      const winIndex = combo.find((i) => board[i] === null);
      if (winIndex !== undefined) return winIndex;
    }
  }

  return -1;
}

/**
 * 보드의 네 모서리 인덱스를 반환합니다.
 *
 * @param size - 보드 크기
 * @returns 모서리 인덱스 배열
 */
function getCorners(size: BoardSize): number[] {
  const last = size - 1;
  return [
    0,                    // 왼쪽 위
    last,                 // 오른쪽 위
    last * size,          // 왼쪽 아래
    last * size + last,   // 오른쪽 아래
  ];
}

// ----------------------------------------------------------
// 💪 어려운 난이도: 미니맥스 알고리즘
// ----------------------------------------------------------

/**
 * 미니맥스(Minimax) 알고리즘으로 최적의 수를 찾습니다.
 * - 3×3: 완전 탐색 (모든 경우의 수를 계산, 절대 지지 않음)
 * - 5×5: 깊이 제한 탐색 (성능을 위해 4단계까지만 탐색)
 *
 * @param board    - 현재 보드 상태
 * @param size     - 보드 크기
 * @param aiPlayer - AI의 마크
 * @returns 최적의 셀 인덱스
 */
function getHardMove(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X'
): number {
  // 5×5 보드에서 빈 칸이 많으면 먼저 규칙 기반으로 판단
  const emptyCells = board.filter((c) => c === null).length;

  if (size === 5 && emptyCells > 20) {
    // 게임 초반: 중앙 또는 중앙 주변을 선점하는 것이 유리
    const center = 12; // 5×5 보드의 정중앙
    if (board[center] === null) return center;

    // 중앙 주변 4칸
    const nearCenter = [7, 11, 13, 17];
    const emptyNearCenter = nearCenter.filter((i) => board[i] === null);
    if (emptyNearCenter.length > 0) {
      return emptyNearCenter[Math.floor(Math.random() * emptyNearCenter.length)];
    }
  }

  // 탐색 깊이 설정: 3×3은 완전 탐색, 5×5는 깊이 제한
  const maxDepth = size === 3 ? Infinity : 4;

  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue; // 이미 채워진 칸은 스킵

    // 이 위치에 AI 마크를 놓아본다 (시뮬레이션)
    const newBoard = [...board];
    newBoard[i] = aiPlayer;

    // 미니맥스로 이 수의 점수를 계산
    const score = minimax(
      newBoard,
      size,
      0,           // 현재 깊이: 0 (루트)
      false,       // 다음은 상대 턴(최소화)
      aiPlayer,
      -Infinity,   // 알파: 최대 하한값
      Infinity,    // 베타: 최소 상한값
      maxDepth
    );

    // 더 높은 점수의 수를 선택
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

/**
 * 미니맥스(Minimax) 알고리즘 + 알파-베타 가지치기(Pruning)
 *
 * 게임 트리를 재귀적으로 탐색하여 각 수의 점수를 매깁니다.
 * - AI 턴(최대화): 가장 높은 점수를 선택
 * - 상대 턴(최소화): 가장 낮은 점수를 선택
 *
 * 알파-베타 가지치기는 불필요한 탐색을 건너뛰어 성능을 향상시킵니다.
 *
 * @param board        - 시뮬레이션된 보드 상태
 * @param size         - 보드 크기
 * @param depth        - 현재 탐색 깊이
 * @param isMaximizing - AI 턴(최대화)이면 true, 상대 턴(최소화)이면 false
 * @param aiPlayer     - AI의 마크
 * @param alpha        - 알파 값 (현재까지 최대화 플레이어의 최적 값)
 * @param beta         - 베타 값 (현재까지 최소화 플레이어의 최적 값)
 * @param maxDepth     - 최대 탐색 깊이
 * @returns 이 상태의 점수 (+10: AI 승, -10: 상대 승, 0: 무승부/불확실)
 */
function minimax(
  board: BoardState,
  size: BoardSize,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: 'O' | 'X',
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  // 게임 결과 확인 (종료 조건)
  const result = checkGameResult(board, size);

  // AI가 이겼으면 양수 점수 (깊이가 얕을수록 높은 점수 → 빨리 이기는 수 선호)
  if (result.winner === aiPlayer) return 10 - depth;
  // 상대가 이겼으면 음수 점수 (깊이가 얕을수록 큰 벌점 → 빨리 지는 수 회피)
  if (result.winner === getOpponent(aiPlayer)) return depth - 10;
  // 무승부이면 0점
  if (result.isDraw) return 0;

  // 최대 탐색 깊이에 도달하면 휴리스틱 평가
  if (depth >= maxDepth) {
    return evaluateBoard(board, size, aiPlayer);
  }

  const humanPlayer = getOpponent(aiPlayer);

  if (isMaximizing) {
    // AI 턴 (최대화): 가장 높은 점수를 찾음
    let maxScore = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null) continue;

      const newBoard = [...board];
      newBoard[i] = aiPlayer;

      const score = minimax(newBoard, size, depth + 1, false, aiPlayer, alpha, beta, maxDepth);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);

      // 베타 커트오프: 이 분기는 더 탐색할 필요 없음
      if (beta <= alpha) break;
    }

    return maxScore;
  } else {
    // 상대 턴 (최소화): 가장 낮은 점수를 찾음
    let minScore = Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null) continue;

      const newBoard = [...board];
      newBoard[i] = humanPlayer;

      const score = minimax(newBoard, size, depth + 1, true, aiPlayer, alpha, beta, maxDepth);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);

      // 알파 커트오프: 이 분기는 더 탐색할 필요 없음
      if (beta <= alpha) break;
    }

    return minScore;
  }
}

// ----------------------------------------------------------
// 📊 휴리스틱 평가 함수 (5×5 보드용)
// ----------------------------------------------------------

/**
 * 보드의 현재 상태를 점수로 평가합니다. (깊이 제한 탐색에서 사용)
 * 완전 탐색이 불가능할 때, 대략적인 유불리를 판단하는 데 사용됩니다.
 *
 * 평가 기준:
 * - AI가 유리한 라인(AI 마크만 있고 빈 칸과 섞인 라인) → 양수
 * - 상대가 유리한 라인 → 음수
 * - 2개 연속은 1개 연속보다 높은 점수
 *
 * @param board    - 현재 보드 상태
 * @param size     - 보드 크기
 * @param aiPlayer - AI의 마크
 * @returns 평가 점수 (양수: AI 유리, 음수: 상대 유리)
 */
function evaluateBoard(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X'
): number {
  const combinations = getWinCombinations(size);
  const humanPlayer = getOpponent(aiPlayer);
  let score = 0;

  // 승리에 필요한 연속 개수
  const winLength = getWinLength(size);

  for (const combo of combinations) {
    // 이 라인에서 AI와 상대의 마크 개수 세기
    const aiCount = combo.filter((i) => board[i] === aiPlayer).length;
    const humanCount = combo.filter((i) => board[i] === humanPlayer).length;

    // 한 라인에 AI와 상대 마크가 섞여 있으면 → 아무도 이길 수 없는 라인, 스킵
    if (aiCount > 0 && humanCount > 0) continue;

    // AI만 있는 라인: 마크 개수에 따라 가산점 (승리에 가까울수록 높은 점수)
    if (aiCount === winLength - 1) score += 10;       // 1개만 더 놓으면 승리!
    else if (aiCount === winLength - 2) score += 3;   // 2개 부족, 그래도 유망
    else if (aiCount >= 1) score += 1;                // 잠재력 있음

    // 상대만 있는 라인: 마크 개수에 따라 감점
    if (humanCount === winLength - 1) score -= 10;    // 상대가 곧 이길 수 있어 위험!
    else if (humanCount === winLength - 2) score -= 3;
    else if (humanCount >= 1) score -= 1;
  }

  return score;
}

// ----------------------------------------------------------
// ⭐ 15×15 오목 AI 전략
// ----------------------------------------------------------
// 오목은 225칸이라 미니맥스 완전 탐색이 불가능합니다.
// 대신 "후보 셀 필터링 + 점수 기반 평가" 방식을 사용합니다.
// - 기존 돌 주변(2칸 이내)의 빈 칸만 후보로 고려하여 탐색 범위를 줄입니다.
// - 각 후보 칸에 돌을 놓았을 때의 점수를 계산합니다.

/**
 * 15×15 오목 AI 메인 함수
 * 난이도에 따라 다른 전략을 사용합니다.
 */
function getGomokuMove(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X',
  difficulty: Difficulty,
  emptyCells: number[]
): number {
  const humanPlayer = getOpponent(aiPlayer);

  // 게임 처음: 보드가 비어있으면 정중앙에 놓기
  const center = Math.floor(size / 2) * size + Math.floor(size / 2); // 15×15의 정중앙 = 112
  if (board[center] === null && emptyCells.length > size * size - 3) {
    return center;
  }

  // 쉼움: 후보 셀 중 무작위 (가끔 좋은 수를 둘 수도 있음)
  if (difficulty === 'easy') {
    // 30% 확률로 좋은 수, 70% 확률로 랜덤
    if (Math.random() < 0.3) {
      const move = findBestGomokuMove(board, size, aiPlayer);
      if (move !== -1) return move;
    }
    const candidates = getCandidateCells(board, size);
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // 보통: 이기는 수/막는 수 우선, 그 다음 점수 기반
  if (difficulty === 'medium') {
    // 1. 즉시 승리하는 수
    const winMove = findWinningMove(board, size, aiPlayer);
    if (winMove !== -1) return winMove;
    // 2. 상대 승리 막는 수
    const blockMove = findWinningMove(board, size, humanPlayer);
    if (blockMove !== -1) return blockMove;
    // 3. 점수 기반 선택 (가끔 실수)
    if (Math.random() < 0.85) {
      const move = findBestGomokuMove(board, size, aiPlayer);
      if (move !== -1) return move;
    }
    const candidates = getCandidateCells(board, size);
    return candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // 어려움: 항상 최적의 수
  const move = findBestGomokuMove(board, size, aiPlayer);
  if (move !== -1) return move;

  // 폴백: 후보 셀 중 무작위
  const candidates = getCandidateCells(board, size);
  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

/**
 * 기존 돌 주변(2칸 이내)의 빈 칸만 후보로 반환합니다.
 * 225칸 전체를 탐색하는 대신, 실제로 의미 있는 위치만 고려하여 성능을 확보합니다.
 */
function getCandidateCells(board: BoardState, size: number): number[] {
  const candidateSet = new Set<number>();
  const radius = 2; // 기존 돌로부터 2칸 반경

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) continue; // 빈 칸은 스킵

    const row = Math.floor(i / size);
    const col = i % size;

    // 현재 돌 주변 (2칸 반경) 내의 빈 칸을 후보에 추가
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const idx = nr * size + nc;
          if (board[idx] === null) {
            candidateSet.add(idx);
          }
        }
      }
    }
  }

  return Array.from(candidateSet);
}

/**
 * 오목에서 가장 점수가 높은 수를 찾습니다.
 * 각 후보 칸에 AI와 상대를 각각 놓아보고 점수 차이를 계산합니다.
 * 공격(AI 점수)과 방어(상대 점수 차단) 모두 고려합니다.
 */
function findBestGomokuMove(
  board: BoardState,
  size: BoardSize,
  aiPlayer: 'O' | 'X'
): number {
  const humanPlayer = getOpponent(aiPlayer);
  const candidates = getCandidateCells(board, size as number);
  if (candidates.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = -1;

  for (const idx of candidates) {
    // AI가 여기에 놓았을 때의 공격 점수
    const boardWithAi = [...board];
    boardWithAi[idx] = aiPlayer;
    const attackScore = evaluateBoard(boardWithAi, size, aiPlayer);

    // 상대가 여기에 놓았을 때의 방어 점수 (막는 효과)
    const boardWithHuman = [...board];
    boardWithHuman[idx] = humanPlayer;
    const defenseScore = evaluateBoard(boardWithHuman, size, humanPlayer);

    // 총점: 공격 + 방어 (방어도 중요하므로 동등 가중치)
    const totalScore = attackScore + defenseScore * 0.9;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = idx;
    }
  }

  return bestMove;
}
