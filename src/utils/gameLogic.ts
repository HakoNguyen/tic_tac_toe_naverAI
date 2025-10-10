// Game logic utilities for TicTacToe

export type Player = "X" | "O" | null;
export type Board = Player[];

// Initial empty board
export const createEmptyBoard = (): Board => Array(9).fill(null);

// Check if a move is valid
export const isValidMove = (board: Board, index: number): boolean => {
  return index >= 0 && index < 9 && board[index] === null;
};

// Make a move on the board
export const makeMove = (
  board: Board,
  index: number,
  player: Player
): Board => {
  if (!isValidMove(board, index) || !player) {
    return board;
  }

  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
};

// Check if the board is full
export const isBoardFull = (board: Board): boolean => {
  return board.every((square) => square !== null);
};

// Get all possible moves
export const getAvailableMoves = (board: Board): number[] => {
  return board
    .map((square, index) => (square === null ? index : null))
    .filter((index): index is number => index !== null);
};

// Winning combinations
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

// Check if a player has won
export const checkWinner = (
  board: Board
): { winner: Player; winningSquares: number[] | null } => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningSquares: combination,
      };
    }
  }

  return {
    winner: null,
    winningSquares: null,
  };
};


export const isGameOver = (board: Board): boolean => {
  const { winner } = checkWinner(board);
  return winner !== null || isBoardFull(board);
};

export const getGameStatus = (board: Board, currentPlayer: Player): string => {
  const { winner,  } = checkWinner(board);

  if (winner) {
    return `Player ${winner} wins!`;
  }

  if (isBoardFull(board)) {
    return "It's a draw!";
  }

  return `Next player: ${currentPlayer}`;
};


export const getOtherPlayer = (player: Player): Player => {
  return player === "X" ? "O" : "X";
};
