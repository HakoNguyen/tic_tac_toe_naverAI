import {
  Board,
  Player,
  checkWinner,
  isBoardFull,
  getAvailableMoves,
} from "./gameLogic";

export type Difficulty = "easy" | "hard";

// Easy AI: Random move selection
export const getRandomMove = (board: Board): number => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) {
    return -1;
  }

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

// Hard AI: Minimax algorithm
// Returns the best move for the AI using minimax with alpha-beta pruning
export const getMinimaxMove = (
  board: Board,
  player: Player
): { move: number; score: number; positionsEvaluated: number } => {
  let positionsEvaluated = 0;

  const minimax = (
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): number => {
    positionsEvaluated++;

    const { winner } = checkWinner(board);

    // Base cases: evaluate terminal nodes from AI perspective
    if (winner === "O") {
      // AI wins
      return 10 - depth; // Prefer faster wins
    }
    if (winner === "X") {
      // Human wins
      return depth - 10; // Prefer slower losses
    }
    if (isBoardFull(board)) {
      // Draw
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      const availableMoves = getAvailableMoves(board);

      for (const move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = "O";
        const evaluation = minimax(newBoard, depth + 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      const availableMoves = getAvailableMoves(board);

      for (const move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = "X";
        const evaluation = minimax(newBoard, depth + 1, true, alpha, beta);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      return minEval;
    }
  };

  const availableMoves = getAvailableMoves(board);
  let bestMove = -1;
  let bestScore = -Infinity;

  console.log(
    `🤖 AI (${player}) evaluating ${availableMoves.length} possible moves...`
  );

  for (const move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = player;
    const score = minimax(newBoard, 0, false);

    console.log(`  Move ${move}: score = ${score}`);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  console.log(`🎯 AI chooses move ${bestMove} with score ${bestScore}`);
  console.log(`📊 Total positions evaluated: ${positionsEvaluated}`);

  return {
    move: bestMove,
    score: bestScore,
    positionsEvaluated,
  };
};

// Main AI function that chooses difficulty
export const getAIMove = (
  board: Board,
  difficulty: Difficulty,
  player: Player
): { move: number; positionsEvaluated?: number } => {
  const startTime = performance.now();

  let result: { move: number; positionsEvaluated?: number };

  if (difficulty === "easy") {
    result = { move: getRandomMove(board) };
  } else {
    const minimaxResult = getMinimaxMove(board, player);
    result = {
      move: minimaxResult.move,
      positionsEvaluated: minimaxResult.positionsEvaluated,
    };
  }

  const endTime = performance.now();
  const thinkingTime = Math.round(endTime - startTime);

  console.log(`⏱️ AI thinking time: ${thinkingTime}ms`);

  return result;
};
