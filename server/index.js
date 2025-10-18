const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let gameState = {
  board: new Array(25).fill(0),
  players: {
    odd: null,
    even: null
  },
  currentPlayer: 'ODD',
  gameOver: false,
  winner: null,
  winningLine: null
};

const WIN_LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

function checkWin(board) {
  for (const line of WIN_LINES) {
    const values = line.map(index => board[index]);
    
    if (values.includes(0)) {
      continue;
    }
    
    if (values.every(v => v === 1)) {
      return { winner: 'ODD', winningLine: line };
    }
    
    if (values.every(v => v === 2)) {
      return { winner: 'EVEN', winningLine: line };
    }
  }
  
  return { winner: null, winningLine: null };
}

function broadcastGameState() {
  io.emit('gameState', {
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    gameOver: gameState.gameOver,
    winner: gameState.winner,
    winningLine: gameState.winningLine,
    playersConnected: {
      odd: gameState.players.odd !== null,
      even: gameState.players.even !== null
    }
  });
}

function resetGame() {
  gameState.board = new Array(25).fill(0);
  gameState.currentPlayer = 'ODD';
  gameState.gameOver = false;
  gameState.winner = null;
  gameState.winningLine = null;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  let playerRole = null;
  if (gameState.players.odd === null) {
    gameState.players.odd = socket.id;
    playerRole = 'ODD';
    console.log(`Assigned ODD player: ${socket.id}`);
  } else if (gameState.players.even === null) {
    gameState.players.even = socket.id;
    playerRole = 'EVEN';
    console.log(`Assigned EVEN player: ${socket.id}`);
  } else {
    socket.emit('error', { message: 'Game is full' });
    socket.disconnect();
    return;
  }
  
  socket.emit('playerAssigned', {
    player: playerRole,
    board: gameState.board
  });
  
  broadcastGameState();
  
  socket.on('increment', (data) => {
    if (gameState.gameOver) {
      return;
    }
    
    const { square } = data;
    
    if (square < 0 || square >= 25) {
      socket.emit('error', { message: 'Invalid square index' });
      return;
    }
    
    if (playerRole !== gameState.currentPlayer) {
      socket.emit('error', { message: `It's ${gameState.currentPlayer} player's turn` });
      return;
    }
    
    if (gameState.board[square] !== 0) {
      socket.emit('error', { message: 'Square already occupied' });
      return;
    }
    
    if (playerRole === 'ODD') {
      gameState.board[square] = 1;
    } else {
      gameState.board[square] = 2;
    }
    
    console.log(`Square ${square} set to ${gameState.board[square]} by ${playerRole} player`);
    
    gameState.currentPlayer = gameState.currentPlayer === 'ODD' ? 'EVEN' : 'ODD';
    
    const { winner, winningLine } = checkWin(gameState.board);
    
    if (winner) {
      gameState.gameOver = true;
      gameState.winner = winner;
      gameState.winningLine = winningLine;
      console.log(`Game over! ${winner} player wins!`);
    }
    
    io.emit('update', {
      square: square,
      value: gameState.board[square],
      currentPlayer: gameState.currentPlayer,
      gameOver: gameState.gameOver,
      winner: gameState.winner,
      winningLine: gameState.winningLine
    });
  });
  
  socket.on('newGame', () => {
    resetGame();
    broadcastGameState();
    console.log('New game started');
  });
  
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    if (gameState.players.odd === socket.id) {
      gameState.players.odd = null;
    } else if (gameState.players.even === socket.id) {
      gameState.players.even = null;
    }
    
    if (gameState.gameOver === false && (gameState.players.odd !== null || gameState.players.even !== null)) {
      gameState.gameOver = true;
      gameState.winner = 'DISCONNECT';
      console.log('Game ended due to player disconnect');
    }
    
    broadcastGameState();
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
