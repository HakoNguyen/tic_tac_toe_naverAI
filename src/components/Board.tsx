import React from "react";
import Square from "./Square";

interface BoardProps {
  squares: (string | null)[];
  onSquareClick: (index: number) => void;
  winningSquares: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({
  squares,
  onSquareClick,
  winningSquares,
  disabled,
}) => {
  const boardStyle: React.CSSProperties = {
    display: "inline-block",
    margin: "20px auto",
    border: "3px solid #333",
    borderRadius: "10px",
    padding: "10px",
    background: "#f8f9fa",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const rowStyle: React.CSSProperties = {
    clear: "both",
    content: '""',
    display: "table",
  };

  const renderSquare = (index: number) => {
    const isWinning = winningSquares ? winningSquares.includes(index) : false;

    return (
      <Square
        key={index}
        value={squares[index]}
        onClick={() => onSquareClick(index)}
        isWinning={isWinning}
        disabled={disabled || squares[index] !== null}
      />
    );
  };

  return (
    <div style={boardStyle}>
      <div style={rowStyle}>
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div style={rowStyle}>
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div style={rowStyle}>
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};

export default Board;
