# Multiplayer Odd/Even Tic-Tac-Toe

Đây là phiên bản multiplayer của trò chơi Odd/Even Tic-Tac-Toe sử dụng WebSockets và operational transforms. Nó minh họa các khái niệm quan trọng của hệ thống phân tán bao gồm quyền hạn server và xử lý các hành động đồng thời.

## 🎮 Luật Chơi

- **Bàn cờ 5x5** (25 ô) - tất cả ô bắt đầu từ 0
- **Hai người chơi**: Người chơi Lẻ và Người chơi Chẵn
- **Không có lượt** - cả hai người chơi có thể click bất kỳ ô nào bất cứ lúc nào
- **Click để tăng** - mỗi click tăng giá trị của ô lên 1
- **Điều kiện thắng**:
  - Người chơi Lẻ thắng nếu có bất kỳ hàng, cột, hoặc đường chéo nào có tất cả 5 số lẻ
  - Người chơi Chẵn thắng nếu có bất kỳ hàng, cột, hoặc đường chéo nào có tất cả 5 số chẵn

## 🚀 Cách Chạy

### Yêu Cầu
Đảm bảo bạn đã cài đặt Node.js.

### Cài Đặt
```bash
# Cài đặt các phụ thuộc
npm install
```

### Chạy Ứng Dụng

**Terminal 1 - Khởi động WebSocket Server:**
```bash
npm run server
```
Server sẽ chạy trên port 3001.

**Terminal 2 - Khởi động React Client:**
```bash
npm start
```
Client sẽ chạy trên port 3000.

### Chơi Game

1. Mở hai cửa sổ/tab trình duyệt đến `http://localhost:3000`
2. Click "🎮 Play Multiplayer Odd/Even Tic-Tac-Toe" ở cả hai cửa sổ
3. Kết nối đầu tiên trở thành Người chơi Lẻ, kết nối thứ hai trở thành Người chơi Chẵn
4. Click bất kỳ ô nào để tăng giá trị của nó
5. Thử click cùng một ô đồng thời ở cả hai cửa sổ để xem operational transforms hoạt động!

## 🧠 Các Khái Niệm Hệ Thống Phân Tán Quan Trọng

### Quyền Hạn Server
Server duy trì nguồn sự thật duy nhất cho trạng thái game. Khi người chơi click các ô:

1. Client gửi tin nhắn `INCREMENT` đến server
2. Client chờ (không cập nhật UI ngay lập tức)
3. Server xử lý thao tác tăng
4. Server phát sóng giá trị mới đến TẤT CẢ clients
5. Tất cả clients cập nhật UI với giá trị có thẩm quyền từ server

### Operational Transforms
Thay vì gửi trạng thái cuối cùng, chúng ta gửi các thao tác:

**❌ Cách Tiếp Cận Sai (gửi trạng thái):**
```javascript
// SAI: Nói cho server biết giá trị cuối cùng nên là gì
{ type: 'SET_VALUE', square: 12, value: 6 }
// Vấn đề: Nếu cả hai người chơi gửi điều này đồng thời, cái thứ hai sẽ ghi đè cái đầu tiên
```

**✅ Cách Tiếp Cận Đúng (gửi thao tác):**
```javascript
// ĐÚNG: Nói cho server biết thao tác nào cần thực hiện
{ type: 'INCREMENT', square: 12 }
// Server áp dụng từng thao tác: 5 → 6 → 7 (cả hai click đều được tính!)
```

### Xử Lý Click Đồng Thời
Khi cả hai người chơi click cùng một ô cùng lúc:

```
Ô 12 hiện tại hiển thị: 5
Cả hai người chơi click đồng thời

Server nhận cả hai tin nhắn và xử lý theo thứ tự:
  Nhận: INCREMENT ô 12
  Xử lý: board[12] = 5 → 6
  Phát sóng: UPDATE ô 12, giá trị 6
  
  Nhận: INCREMENT ô 12  
  Xử lý: board[12] = 6 → 7
  Phát sóng: UPDATE ô 12, giá trị 7

Clients thấy: 5 → 6 → 7
Kết quả: CẢ HAI click đều được tính! ✓
```

## 🧪 Kiểm Thử Race Conditions

### Chế Độ Chaos
Bật "Chaos Mode" để thêm độ trễ mạng ngẫu nhiên (0-1000ms) để mô phỏng điều kiện mạng thực tế. Điều này giúp dễ dàng quan sát:

- Tin nhắn đến không đúng thứ tự
- Cách operational transforms xử lý các hành động đồng thời
- Tại sao quyền hạn server là quan trọng

### Kiểm Thử Thủ Công
1. Mở hai cửa sổ trình duyệt cạnh nhau
2. Bật Chaos Mode ở cả hai cửa sổ
3. Click nhanh vào cùng các ô ở cả hai cửa sổ
4. Quan sát cách cả hai click đều được tính đúng mặc dù có độ trễ mạng

## 📁 Cấu Trúc Dự Án

```
tic-tac-toe-ai/
├── server/
│   └── index.js              # WebSocket server với game logic
├── src/
│   ├── components/
│   │   ├── MultiplayerGame.tsx  # Component game multiplayer
│   │   ├── Board.tsx            # Bàn cờ 3x3 gốc
│   │   ├── GameInfo.tsx         # Điều khiển game và thống kê
│   │   └── Square.tsx           # Component ô cờ đơn lẻ
│   ├── utils/
│   │   ├── gameLogic.ts         # Game logic gốc
│   │   └── ai.ts                # Thuật toán AI
│   └── App.tsx                  # App chính với navigation
└── package.json
```

## 🔧 Triển Khai Kỹ Thuật

### Tin Nhắn WebSocket

**Client → Server:**
```javascript
// Tăng một ô
{ type: 'increment', square: 12 }

// Yêu cầu game mới
{ type: 'newGame' }
```

**Server → Client:**
```javascript
// Phân công người chơi
{ type: 'playerAssigned', player: 'ODD', board: [...] }

// Cập nhật ô
{ type: 'update', square: 12, value: 6, gameOver: false, winner: null }

// Đồng bộ trạng thái game
{ type: 'gameState', board: [...], gameOver: false, winner: null, ... }

// Lỗi
{ type: 'error', message: 'Game is full' }
```

### Phát Hiện Thắng
Server kiểm tra tất cả các đường thắng có thể:
- 5 hàng: `[0,1,2,3,4]`, `[5,6,7,8,9]`, v.v.
- 5 cột: `[0,5,10,15,20]`, `[1,6,11,16,21]`, v.v.  
- 2 đường chéo: `[0,6,12,18,24]`, `[4,8,12,16,20]`

Với mỗi đường, kiểm tra xem tất cả giá trị có phải số lẻ (Người chơi Lẻ thắng) hoặc tất cả chẵn (Người chơi Chẵn thắng).

## 🎯 Mục Tiêu Học Tập

Triển khai này minh họa:

1. **Tại sao quyền hạn server quan trọng** - ngăn chặn xung đột và đảm bảo tính nhất quán
2. **Cách operational transforms hoạt động** - các thao tác kết hợp tự nhiên, trạng thái xung đột
3. **Giao tiếp thời gian thực** - WebSockets cho phép giao tiếp hai chiều, độ trễ thấp
4. **Xử lý race condition** - sắp xếp đúng thứ tự và giải quyết xung đột
5. **Đánh đổi hệ thống phân tán** - thứ tự tin nhắn vs. hiệu suất vs. độ phức tạp

Những khái niệm này áp dụng cho mọi ứng dụng cộng tác thời gian thực: Google Docs, Figma, game multiplayer, ứng dụng chat, và nhiều hơn nữa.

## 🐛 Khắc Phục Sự Cố

**Server không khởi động:**
- Đảm bảo port 3001 có sẵn
- Kiểm tra tất cả phụ thuộc đã được cài đặt: `npm install`

**Client không thể kết nối:**
- Đảm bảo server đang chạy trên port 3001
- Kiểm tra console trình duyệt để tìm lỗi kết nối
- Xác minh cài đặt CORS nếu chạy trên các port khác nhau

**Game không hoạt động đúng:**
- Kiểm tra console trình duyệt để tìm lỗi WebSocket
- Đảm bảo cả hai người chơi đã kết nối trước khi bắt đầu
- Thử làm mới cả hai cửa sổ trình duyệt

## 📚 Đọc Thêm

- [Tài liệu Socket.io](https://socket.io/docs/)
- [Operational Transforms](https://en.wikipedia.org/wiki/Operational_transformation)
- [Giao thức WebSocket](https://tools.ietf.org/html/rfc6455)
- [Khái niệm Hệ thống Phân tán](https://en.wikipedia.org/wiki/Distributed_computing)
