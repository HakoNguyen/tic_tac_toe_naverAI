# Tic Tac Toe AI (React + TypeScript)

Một trò chơi TicTacToe có đối thủ AI với 2 mức độ: Dễ (ngẫu nhiên) và Khó (minimax có alpha-beta). Dự án có theo dõi điểm số, streak và thống kê hiệu suất AI.

## 🚀 Cài đặt & chạy

```bash
# Cài đặt phụ thuộc (chạy trong thư mục tic-tac-toe-ai)
npm install

# Chạy dev server
npm start

# Ứng dụng tại http://localhost:3000
```

## 🎮 Cách chơi

- Bạn là "X", AI là "O".
- Click vào ô trống để đánh dấu.
- Chọn mức độ AI: Easy hoặc Hard (có thể đổi bất kỳ lúc nào).
- Nhấn "New Game" để bắt đầu ván mới.
- Hệ thống tự động phát hiện thắng/thua/hòa và highlight đường thắng.
- Thống kê (Wins/Losses/Draws, Streak) được lưu trong `localStorage`.

## 🧠 Mức độ AI

### Easy

- Chọn nước đi ngẫu nhiên trong các ô còn trống.
- Cố ý yếu, dễ bị người chơi đánh bại.

### Hard

- Sử dụng thuật toán minimax với alpha-beta pruning.
- Không thể bị đánh bại (tệ nhất là hòa).
- Console sẽ log:
  - Điểm số (score) của từng nước đi ứng viên
  - Số lượng trạng thái đã đánh giá (positions evaluated)
  - Thời gian suy nghĩ (ms)

Mẹo: Mở DevTools Console để theo dõi quá trình AI đánh giá.

## 📁 Cấu trúc chính

```
src/
├── App.tsx                 # Component chính, quản lý state và luồng game
├── components/
│   ├── Board.tsx           # Vẽ bàn cờ 3x3
│   ├── Square.tsx          # Một ô cờ (inline styles)
│   └── GameInfo.tsx        # Điều khiển, thống kê, hiệu suất (inline styles)
├── utils/
│   ├── gameLogic.ts        # Kiểm tra thắng/hòa và helper
│   └── ai.ts               # AI (random + minimax)
└── index.css               # Chứa keyframes pulse cho hiệu ứng thắng
```

## 🧩 Tổng quan game logic

- `checkWinner(board)`: trả về người thắng (`"X" | "O" | null`) và các ô thắng.
- `isBoardFull(board)`: hết ô trống hay chưa.
- `isGameOver(board)`: kết thúc do thắng hoặc hòa.
- `getAvailableMoves(board)`: danh sách index các ô trống.

Các hàm này giúp tách biệt logic khỏi UI.

## ♟️ Giải thích minimax (Hard)

File: `src/utils/ai.ts`

```ts
// getMinimaxMove(board, player): trả về nước đi tốt nhất cho AI "O"
// Dùng minimax(board, depth, isMaximizing, alpha, beta)
// Chấm điểm (góc nhìn AI):
// - AI thắng ("O"): 10 - depth    // ưu tiên thắng nhanh
// - Người thắng ("X"): depth - 10 // đẩy thua càng chậm càng tốt
// - Hòa: 0
// Alpha-beta pruning cắt nhánh khi beta <= alpha
```

Ý chính:

- Trạng thái kết thúc trả về điểm tĩnh (win/loss/draw).
- AI (maximizer) đánh "O"; Người (minimizer) đánh "X".
- Tham số `depth` ưu tiên thắng nhanh/thua chậm.
- Alpha-beta giúp giảm số trạng thái cần duyệt.

## 📊 Thống kê hiệu suất

- Số trạng thái đã đánh giá (Hard)
- Thời gian AI suy nghĩ (ms)
- Hiển thị trong panel thông tin; chi tiết hơn trong Console.

## 💾 Lưu trữ

- Khóa `localStorage`: `ticTacToeStats`
- Lưu: wins, losses, draws, currentStreak, bestStreak

## 🧪 Kiểm thử AI

- Thử các chiến thuật phổ biến (đi giữa, đi góc trước). Ở Hard, bạn không thể buộc AI thua.
- Dùng Console logs để hiểu vì sao AI chọn nước đi.

## 🛠 Công nghệ

- React 18 + TypeScript
- Inline styles (không dùng CSS Modules)

## 📜 License

MIT
