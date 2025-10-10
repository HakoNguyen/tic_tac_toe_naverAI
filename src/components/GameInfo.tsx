import React from "react";

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

interface GameInfoProps {
  status: string;
  currentPlayer: string;
  difficulty: "easy" | "hard";
  onDifficultyChange: (difficulty: "easy" | "hard") => void;
  onNewGame: () => void;
  stats: GameStats;
  aiThinkingTime?: number;
  positionsEvaluated?: number;
}

const GameInfo: React.FC<GameInfoProps> = ({
  status,
  currentPlayer,
  difficulty,
  onDifficultyChange,
  onNewGame,
  stats,
  aiThinkingTime,
  positionsEvaluated,
}) => {
  const gameInfoStyle: React.CSSProperties = {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const gameStatusStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "20px",
  };

  const statusTitleStyle: React.CSSProperties = {
    margin: "0 0 10px 0",
    color: "#333",
    fontSize: "1.5em",
  };

  const currentPlayerStyle: React.CSSProperties = {
    margin: 0,
    color: "#666",
    fontSize: "1.1em",
  };

  const gameControlsStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const difficultySelectorStyle: React.CSSProperties = {
    marginBottom: "15px",
  };

  const difficultyLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  };

  const difficultyButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
  };

  const difficultyButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "8px 16px",
    border: "2px solid #ddd",
    background: isActive ? "#4caf50" : "#fff",
    color: isActive ? "white" : "#333",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
  });

  const newGameButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    background: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background 0.2s ease",
  };

  const gameStatsStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const statsTitleStyle: React.CSSProperties = {
    margin: "0 0 15px 0",
    color: "#333",
    textAlign: "center",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  };

  const statItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "#f8f9fa",
    borderRadius: "5px",
    borderLeft: "3px solid #4caf50",
  };

  const statLabelStyle: React.CSSProperties = {
    fontWeight: "bold",
    color: "#666",
  };

  const statValueStyle: React.CSSProperties = {
    color: "#333",
    fontWeight: "bold",
  };

  const aiPerformanceStyle: React.CSSProperties = {
    background: "#e3f2fd",
    padding: "15px",
    borderRadius: "5px",
    borderLeft: "3px solid #2196f3",
  };

  const aiPerformanceTitleStyle: React.CSSProperties = {
    margin: "0 0 10px 0",
    color: "#1976d2",
  };

  const aiPerformanceTextStyle: React.CSSProperties = {
    margin: "5px 0",
    color: "#333",
    fontFamily: "monospace",
  };

  return (
    <div style={gameInfoStyle}>
      <div style={gameStatusStyle}>
        <h2 style={statusTitleStyle}>{status}</h2>
        <p style={currentPlayerStyle}>
          {currentPlayer === "X" ? "Your turn" : "AI thinking..."}
        </p>
      </div>

      <div style={gameControlsStyle}>
        <div style={difficultySelectorStyle}>
          <label style={difficultyLabelStyle}>AI Difficulty:</label>
          <div style={difficultyButtonsStyle}>
            <button
              style={difficultyButtonStyle(difficulty === "easy")}
              onClick={() => onDifficultyChange("easy")}
            >
              Easy
            </button>
            <button
              style={difficultyButtonStyle(difficulty === "hard")}
              onClick={() => onDifficultyChange("hard")}
            >
              Hard
            </button>
          </div>
        </div>

        <button style={newGameButtonStyle} onClick={onNewGame}>
          New Game
        </button>
      </div>

      <div style={gameStatsStyle}>
        <h3 style={statsTitleStyle}>Statistics</h3>
        <div style={statsGridStyle}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Wins:</span>
            <span style={statValueStyle}>{stats.wins}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Losses:</span>
            <span style={statValueStyle}>{stats.losses}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Draws:</span>
            <span style={statValueStyle}>{stats.draws}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Current Streak:</span>
            <span style={statValueStyle}>{stats.currentStreak}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Best Streak:</span>
            <span style={statValueStyle}>{stats.bestStreak}</span>
          </div>
        </div>
      </div>

      {difficulty === "hard" &&
        (aiThinkingTime !== undefined || positionsEvaluated !== undefined) && (
          <div style={aiPerformanceStyle}>
            <h4 style={aiPerformanceTitleStyle}>AI Performance</h4>
            {aiThinkingTime !== undefined && (
              <p style={aiPerformanceTextStyle}>
                Thinking time: {aiThinkingTime}ms
              </p>
            )}
            {positionsEvaluated !== undefined && (
              <p style={aiPerformanceTextStyle}>
                Positions evaluated: {positionsEvaluated.toLocaleString()}
              </p>
            )}
          </div>
        )}
    </div>
  );
};

export default GameInfo;
