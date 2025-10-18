import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface PlayerAssignedData {
  player: 'ODD' | 'EVEN';
  board: number[];
}

interface GameStateData {
  board: number[];
  currentPlayer: string;
  gameOver: boolean;
  winner: string | null;
  winningLine: number[] | null;
  playersConnected: {
    odd: boolean;
    even: boolean;
  };
}

interface UpdateData {
  square: number;
  value: number;
  currentPlayer: string;
  gameOver: boolean;
  winner: string | null;
  winningLine: number[] | null;
}

interface ErrorData {
  message: string;
}

interface GameState {
  board: number[];
  currentPlayer: string;
  gameOver: boolean;
  winner: string | null;
  winningLine: number[] | null;
  playersConnected: {
    odd: boolean;
    even: boolean;
  };
}

interface MultiplayerGameProps {
  onBack: () => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ onBack }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [player, setPlayer] = useState<'ODD' | 'EVEN' | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: new Array(25).fill(0),
    currentPlayer: 'ODD',
    gameOver: false,
    winner: null,
    winningLine: null,
    playersConnected: { odd: false, even: false }
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'waiting'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [chaosMode, setChaosMode] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server. Make sure the server is running.');
      setConnectionStatus('disconnected');
    });

    newSocket.on('playerAssigned', (data: PlayerAssignedData) => {
      console.log('Player assigned:', data.player);
      setPlayer(data.player);
      setGameState(prev => ({
        ...prev,
        board: data.board
      }));
      
      if (data.player === 'ODD') {
        setConnectionStatus('waiting');
      }
    });

    newSocket.on('gameState', (data: GameStateData) => {
      console.log('Game state update:', data);
      setGameState(data);
      
      if (data.playersConnected.odd && data.playersConnected.even) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('waiting');
      }
    });

    newSocket.on('update', (data: UpdateData) => {
      console.log('Square update:', data);
      setGameState(prev => ({
        ...prev,
        board: prev.board.map((value, index) => 
          index === data.square ? data.value : value
        ),
        currentPlayer: data.currentPlayer,
        gameOver: data.gameOver,
        winner: data.winner,
        winningLine: data.winningLine
      }));
    });

    newSocket.on('error', (data: ErrorData) => {
      console.error('Server error:', data.message);
      setError(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSquareClick = useCallback((index: number) => {
    if (!socket || gameState.gameOver || connectionStatus !== 'connected') {
      return;
    }

    if (gameState.currentPlayer !== player) {
      return;
    }

    const message = { type: 'increment', square: index };
    
    if (chaosMode) {
      const delay = Math.random() * 1000;
      setTimeout(() => {
        socket.emit('increment', message);
      }, delay);
    } else {
      socket.emit('increment', message);
    }
  }, [socket, gameState.gameOver, gameState.currentPlayer, player, connectionStatus, chaosMode]);

  const handleNewGame = useCallback(() => {
    if (socket) {
      socket.emit('newGame');
    }
  }, [socket]);

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'waiting':
        return 'Waiting for opponent...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getGameStatusText = () => {
    if (gameState.gameOver) {
      if (gameState.winner === 'DISCONNECT') {
        return 'Opponent disconnected';
      }
      return `${gameState.winner} Player Wins!`;
    }
    
    if (!gameState.playersConnected.odd || !gameState.playersConnected.even) {
      return 'Waiting for opponent...';
    }
    
    if (gameState.currentPlayer === player) {
      return `Your turn (${player} Player)`;
    } else {
      return `${gameState.currentPlayer} Player's turn`;
    }
  };

  const renderSquare = (index: number) => {
    const value = gameState.board[index];
    const isWinning = gameState.winningLine?.includes(index);
    
    const squareStyle: React.CSSProperties = {
      width: '60px',
      height: '60px',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: gameState.gameOver ? 'default' : 'pointer',
      backgroundColor: isWinning ? '#ffeb3b' : 
                      value % 2 === 0 ? '#e3f2fd' : '#f3e5f5',
      color: value % 2 === 0 ? '#1976d2' : '#7b1fa2',
      transition: 'all 0.2s ease',
    };

    const handleClick = () => handleSquareClick(index);

    return (
      <div
        key={index}
        style={squareStyle}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!gameState.gameOver) {
            e.currentTarget.style.backgroundColor = isWinning ? '#fff176' : 
                                                   value % 2 === 0 ? '#bbdefb' : '#e1bee7';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isWinning ? '#ffeb3b' : 
                                                   value % 2 === 0 ? '#e3f2fd' : '#f3e5f5';
        }}
      >
        {value}
      </div>
    );
  };

  const renderBoard = () => {
    const boardStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '2px',
      padding: '20px',
      backgroundColor: '#333',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    };

    return (
      <div style={boardStyle}>
        {Array.from({ length: 25 }, (_, index) => renderSquare(index))}
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const titleStyle: React.CSSProperties = {
    margin: '0 0 10px 0',
    fontSize: '2.5em',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const gameContainerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#4CAF50',
    color: 'white',
  };

  const backButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f44336',
  };

  const chaosButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: chaosMode ? '#ff9800' : '#9e9e9e',
  };

  const statusStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
  };

  const errorStyle: React.CSSProperties = {
    color: '#ffeb3b',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    padding: '10px',
    borderRadius: '8px',
    margin: '10px 0',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Multiplayer Odd/Even Tic-Tac-Toe</h1>
        <p style={{ margin: 0, fontSize: '1.2em', opacity: 0.9 }}>
          Click squares to increment them. Odd player wins with all odd numbers in a line, Even player wins with all even numbers in a line.
        </p>
      </header>

      <main style={gameContainerStyle}>
        {error && (
          <div style={errorStyle}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={statusStyle}>
          <div>Status: {getConnectionStatusText()}</div>
          <div>{getGameStatusText()}</div>
        </div>

        {renderBoard()}

        <div style={controlsStyle}>
          <button style={backButtonStyle} onClick={onBack}>
            Back to Single Player
          </button>
          
          <button style={buttonStyle} onClick={handleNewGame}>
            New Game
          </button>
          
          <button 
            style={chaosButtonStyle} 
            onClick={() => setChaosMode(!chaosMode)}
            title="Add random network delay to test race conditions"
          >
            {chaosMode ? 'Chaos Mode: ON' : 'Chaos Mode: OFF'}
          </button>
        </div>

        <div style={{ color: 'white', fontSize: '14px', opacity: 0.8, maxWidth: '600px' }}>
          <p><strong>How to test:</strong> Open two browser windows side-by-side and play against yourself!</p>
          <p><strong>Chaos Mode:</strong> Adds random delays to simulate network lag and test simultaneous clicks.</p>
        </div>
      </main>
    </div>
  );
};

export default MultiplayerGame;
