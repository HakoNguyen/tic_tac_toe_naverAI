import React from "react";

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  isWinning,
  disabled,
}) => {
  const baseStyle: React.CSSProperties = {
    background: "#fff",
    border: "2px solid #999",
    float: "left",
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: "34px",
    height: "60px",
    marginRight: "-1px",
    marginTop: "-1px",
    padding: 0,
    textAlign: "center",
    width: "60px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    opacity: disabled ? 0.6 : 1,
  };

  const winningStyle: React.CSSProperties = {
    background: "#4caf50",
    color: "white",
    animation: "pulse 0.6s ease-in-out",
  };

  const hoverStyle: React.CSSProperties = !disabled
    ? {
        background: "#f0f0f0",
        transform: "scale(1.05)",
      }
    : {};

  const combinedStyle = {
    ...baseStyle,
    ...(isWinning ? winningStyle : {}),
  };

  return (
    <button
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = isWinning ? "#4caf50" : "#fff";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      {value}
    </button>
  );
};

export default Square;
