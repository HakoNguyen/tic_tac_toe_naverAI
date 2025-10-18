import React, { useState, useEffect, useCallback } from "react";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import MultiplayerGame from "./components/MultiplayerGame";
import {
  createEmptyBoard,
  checkWinner,
  isGameOver,
  getGameStatus,
  makeMove,
  isValidMove,
  Board as BoardType,
  Player,
} from "./utils/gameLogic";
import { getAIMove, Difficulty } from "./utils/ai";

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

const App: React.FC = () => {
  // Game mode state
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer'>('single');
  
  // Single player game state
  const [board, setBoard] = useState<BoardType>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameOver, setGameOver] = useState(false);
  const [winningSquares, setWinningSquares] = useState<number[] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [aiThinkingTime, setAiThinkingTime] = useState<number | undefined>();
  const [positionsEvaluated, setPositionsEvaluated] = useState<
    number | undefined
  >();

  // Statistics
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem("ticTacToeStats");
    return saved
      ? JSON.parse(saved)
      : {
          wins: 0,
          losses: 0,
          draws: 0,
          currentStreak: 0,
          bestStreak: 0,
        };
  });

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ticTacToeStats", JSON.stringify(stats));
  }, [stats]);

  // Handle square click
  const handleSquareClick = useCallback(
    (index: number) => {
      if (gameOver || !isValidMove(board, index) || currentPlayer !== "X") {
        return;
      }

      const newBoard = makeMove(board, index, currentPlayer);
      setBoard(newBoard);

      const { winner: gameWinner, winningSquares: gameWinningSquares } =
        checkWinner(newBoard);

      if (gameWinner || isGameOver(newBoard)) {
        setGameOver(true);
        setWinningSquares(gameWinningSquares);

        // Update statistics
        if (gameWinner === "X") {
          setStats((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            currentStreak: prev.currentStreak + 1,
            bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          }));
        } else if (gameWinner === "O") {
          setStats((prev) => ({
            ...prev,
            losses: prev.losses + 1,
            currentStreak: 0,
          }));
        } else {
          setStats((prev) => ({
            ...prev,
            draws: prev.draws + 1,
            currentStreak: 0,
          }));
        }
      } else {
        setCurrentPlayer("O");
      }
    },
    [board, currentPlayer, gameOver]
  );

  // AI move
  useEffect(() => {
    if (currentPlayer === "O" && !gameOver) {
      const timer = setTimeout(() => {
        const startTime = performance.now();
        const aiResult = getAIMove(board, difficulty, "O");
        const endTime = performance.now();

        setAiThinkingTime(Math.round(endTime - startTime));
        setPositionsEvaluated(aiResult.positionsEvaluated);

        if (aiResult.move !== -1) {
          const newBoard = makeMove(board, aiResult.move, "O");
          setBoard(newBoard);

          const { winner: gameWinner, winningSquares: gameWinningSquares } =
            checkWinner(newBoard);

          if (gameWinner || isGameOver(newBoard)) {
            setGameOver(true);
            setWinningSquares(gameWinningSquares);

            // Update statistics
            if (gameWinner === "O") {
              setStats((prev) => ({
                ...prev,
                losses: prev.losses + 1,
                currentStreak: 0,
              }));
            } else {
              setStats((prev) => ({
                ...prev,
                draws: prev.draws + 1,
                currentStreak: 0,
              }));
            }
          } else {
            setCurrentPlayer("X");
          }
        }
      }, 500); // Small delay to make AI move visible

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, gameOver, difficulty]);

  // New game
  const handleNewGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("X");
    setGameOver(false);
    setWinningSquares(null);
    setAiThinkingTime(undefined);
    setPositionsEvaluated(undefined);
  }, []);

  // Difficulty change
  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      setDifficulty(newDifficulty);
      handleNewGame();
    },
    [handleNewGame]
  );

  // Game mode navigation
  const handleSwitchToMultiplayer = useCallback(() => {
    setGameMode('multiplayer');
  }, []);

  const handleSwitchToSingle = useCallback(() => {
    setGameMode('single');
  }, []);

  // Render multiplayer mode
  if (gameMode === 'multiplayer') {
    return <MultiplayerGame onBack={handleSwitchToSingle} />;
  }

  // Single player mode
  const status = getGameStatus(board, currentPlayer || "X");

  const appStyle: React.CSSProperties = {
    textAlign: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "30px",
    color: "white",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 10px 0",
    fontSize: "2.5em",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  };

  const subtitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.2em",
    opacity: 0.9,
  };

  const gameContainerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
  };

  const multiplayerButtonStyle: React.CSSProperties = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#4CAF50",
    color: "white",
    marginBottom: "20px",
  };

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Tic Tac Toe AI</h1>
        <p style={subtitleStyle}>
          Play against AI or challenge friends in multiplayer mode
        </p>
        <button style={multiplayerButtonStyle} onClick={handleSwitchToMultiplayer}>
          🎮 Play Multiplayer Odd/Even Tic-Tac-Toe
        </button>
      </header>

      <main style={gameContainerStyle}>
        <Board
          squares={board}
          onSquareClick={handleSquareClick}
          winningSquares={winningSquares}
          disabled={gameOver || currentPlayer !== "X"}
        />

        <GameInfo
          status={status}
          currentPlayer={currentPlayer || "X"}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={handleNewGame}
          stats={stats}
          aiThinkingTime={aiThinkingTime}
          positionsEvaluated={positionsEvaluated}
        />
      </main>
    </div>
  );
};

export default App;
