# Chat Flow Documentation - Frontend Testing Guide

Tài liệu này mô tả flow hoạt động của hệ thống chat trong ứng dụng Gender Healthcare REST API, bao gồm ChatController (REST API) và ChatGateway (WebSocket), với các ví dụ cụ thể để frontend test.

## Tổng quan kiến trúc

```
Client ←→ ChatController (REST API) ←→ ChatService ←→ Database
   ↕                                      ↕
ChatGateway (WebSocket) ←→ Redis ←→ Handlers
```

## 1. REST API Flow (ChatController)

### 1.1 Tạo câu hỏi mới

```
POST /api/chat/questions
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (`CreateQuestionDto`):**

```json
{
    "title": "Câu hỏi về sức khỏe sinh sản",
    "content": "Tôi muốn tư vấn về..."
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "uuid-question-id",
        "title": "Câu hỏi về sức khỏe sinh sản",
        "content": "Tôi muốn tư vấn về...",
        "customerId": "uuid-customer-id",
        "createdAt": "2025-06-30T10:00:00.000Z"
    },
    "message": "Question created successfully"
}
```

**Quyền truy cập:** Chỉ CUSTOMER role

---

### 1.2 Gửi tin nhắn text

```
POST /api/chat/questions/:questionId/messages
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (`CreateChatDto`):**

```json
{
    "content": "Xin chào, tôi cần hỗ trợ",
    "type": "text", // text, file, image, public_pdf
    "questionId": "uuid-question-id"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "uuid-message-id",
        "content": "Xin chào, tôi cần hỗ trợ",
        "type": "text", // text, file, image, public_pdf
        "questionId": "uuid-question-id",
        "senderId": "uuid-user-id",
        "createdAt": "2025-06-30T10:05:00.000Z",
        "isRead": false
    },
    "message": "Message sent successfully"
}
```

---

### 1.3 Gửi tin nhắn có file

```
POST /api/chat/questions/:questionId/messages/file
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <File> (image/document)
content: "Đây là file báo cáo của tôi" (optional)
type: "image" hoặc "file" (optional - auto-detect)
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "uuid-message-id",
        "content": "image.jpg",
        "type": "image", // file, image, public_pdf
        "questionId": "uuid-question-id",
        "senderId": "uuid-user-id",
        "fileUrl": "https://storage.example.com/files/...",
        "createdAt": "2025-06-30T10:05:00.000Z"
    },
    "message": "File message sent successfully"
}
```

---

### 1.4 Gửi PDF công khai

```
POST /api/chat/questions/:questionId/messages/public-pdf
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <PDF_File>
content: "Báo cáo xét nghiệm" (optional)
description: "Kết quả xét nghiệm máu ngày 30/06/2025"
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "uuid-message-id",
        "content": "report.pdf",
        "type": "image",
        "questionId": "uuid-question-id",
        "fileUrl": "https://public-bucket.example.com/pdfs/...",
        "description": "Kết quả xét nghiệm máu ngày 30/06/2025"
    },
    "message": "Public PDF message sent successfully"
}
```

---

### 1.5 Lấy lịch sử tin nhắn

```
GET /api/chat/questions/:questionId/messages?page=1&limit=20
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

```
page: 1 (default)
limit: 20 (default, max 100)
```

**Response:**

```json
{
    "success": true,
    "data": {
        "messages": [
            {
                "id": "uuid-message-id",
                "content": "Xin chào",
                "type": "text",
                "senderId": "uuid-user-id",
                "senderName": "Nguyễn Văn A",
                "createdAt": "2025-06-30T10:00:00.000Z",
                "isRead": true
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalItems": 100,
            "limit": 20
        }
    },
    "message": "Messages retrieved successfully"
}
```

---

### 1.6 Lấy tin nhắn có URL file

```
GET /api/chat/questions/:questionId/messages/with-urls?page=1&limit=20
```

**Response:** Tương tự như trên nhưng bao gồm `fileUrl` đầy đủ cho các message có file.

---

### 1.7 Đánh dấu đã đọc

**Đánh dấu 1 message:**

```
PATCH /api/chat/messages/:messageId/read
```

**Đánh dấu tất cả message trong question:**

```
PATCH /api/chat/questions/:questionId/messages/read-all
```

**Response:**

```json
{
    "success": true,
    "message": "Message(s) marked as read"
}
```

---

### 1.8 Xóa tin nhắn

```
DELETE /api/chat/messages/:messageId
```

**Response:**

```json
{
    "success": true,
    "message": "Message deleted successfully"
}
```

---

### 1.9 Các endpoint khác

**Lấy tóm tắt question:**

```
GET /api/chat/questions/:questionId/summary
```

**Đếm tin nhắn chưa đọc:**

```
GET /api/chat/messages/unread-count
```

**Response:**

```json
{
    "success": true,
    "data": {
        "unreadCount": 15
    }
}
```

**Download file:**

```
GET /api/chat/messages/:messageId/file
```

**Response:**

```json
{
    "success": true,
    "data": {
        "fileUrl": "https://presigned-url.example.com/..."
    }
}
```

**Lấy danh sách questions:**

```
GET /api/chat/questions
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid-question-id",
            "title": "Câu hỏi về sức khỏe",
            "lastMessage": {
                "content": "Tin nhắn cuối cùng",
                "createdAt": "2025-06-30T10:00:00.000Z"
            },
            "unreadCount": 3
        }
    ],
    "message": "Questions retrieved successfully"
}
```

## 2. WebSocket Flow (ChatGateway)

### 2.1 Kết nối WebSocket

**Namespace:** `/chat`
**URL:** `ws://localhost:3000/chat` hoặc `wss://domain.com/chat`

**Frontend Setup (Socket.IO Client):**

```javascript
import { io } from 'socket.io-client';

const socket = io('/chat', {
    auth: {
        token: 'Bearer <JWT_TOKEN>',
    },
    transports: ['websocket', 'polling'],
});

// Lắng nghe kết nối thành công
socket.on('connect', () => {
    console.log('Connected to chat server');
});

// Lắng nghe event connected từ server
socket.on('connected', (data) => {
    console.log('Server confirmed connection:', data);
});
```

**Server Response Event:**

```json
{
    "event": "connected",
    "data": {
        "userId": "uuid-user-id",
        "timestamp": "2025-06-30T10:00:00.000Z"
    }
}
```

---

### 2.2 Tham gia room câu hỏi

**Event:** `join_question`

**Frontend Code:**

```javascript
// Gửi request join room
socket.emit(
    'join_question',
    {
        questionId: 'uuid-question-id',
    },
    (acknowledgement) => {
        console.log('Join room response:', acknowledgement);
    },
);

// Lắng nghe user khác join
socket.on('user_joined', (data) => {
    console.log('User joined:', data);
});

// Lắng nghe confirmation
socket.on('joined_question', (data) => {
    console.log('Successfully joined question:', data);
});
```

**Request Data:**

```json
{
    "questionId": "uuid-question-id"
}
```

**Acknowledgement Response:**

```json
{
    "status": "success",
    "message": "Successfully joined question",
    "questionId": "uuid-question-id",
    "timestamp": "2025-06-30T10:00:00.000Z"
}
```

**Server Events:**

- `user_joined`: Khi có user khác join room
- `joined_question`: Confirm join thành công

---

### 2.3 Rời room câu hỏi

**Event:** `leave_question`

**Frontend Code:**

```javascript
socket.emit(
    'leave_question',
    {
        questionId: 'uuid-question-id',
    },
    (acknowledgement) => {
        console.log('Leave room response:', acknowledgement);
    },
);

// Lắng nghe user khác rời room
socket.on('user_left', (data) => {
    console.log('User left:', data);
});
```

---

### 2.4 Gửi tin nhắn realtime

**Event:** `send_message`

**Frontend Code:**

```javascript
const messageData = {
    questionId: 'uuid-question-id',
    content: 'Hello from WebSocket!',
    type: 'text',
};

socket.emit('send_message', messageData, (acknowledgement) => {
    if (acknowledgement.status === 'success') {
        console.log('Message sent successfully');
    } else {
        console.error('Failed to send message:', acknowledgement.message);
    }
});

// Lắng nghe tin nhắn mới
socket.on('new_message', (message) => {
    console.log('New message received:', message);
    // Cập nhật UI với tin nhắn mới
});
```

**Message Data Format:**

```json
{
    "questionId": "uuid-question-id",
    "content": "Hello from WebSocket!",
    "type": "text"
}
```

**New Message Event:**

```json
{
    "event": "new_message",
    "data": {
        "id": "uuid-message-id",
        "content": "Hello from WebSocket!",
        "type": "text",
        "senderId": "uuid-user-id",
        "senderName": "Nguyễn Văn A",
        "questionId": "uuid-question-id",
        "createdAt": "2025-06-30T10:00:00.000Z"
    }
}
```

---

### 2.5 Typing indicator

**Event:** `typing`

**Frontend Code:**

```javascript
// Bắt đầu typing
socket.emit('typing', {
    questionId: 'uuid-question-id',
    isTyping: true,
});

// Dừng typing
socket.emit('typing', {
    questionId: 'uuid-question-id',
    isTyping: false,
});

// Lắng nghe typing status của users khác
socket.on('typing_status', (data) => {
    console.log('Typing status:', data);
    // data: { userId: 'uuid', userName: 'Name', isTyping: true, questionId: 'uuid' }
});

// Auto cleanup typing sau 3 giây
let typingTimeout;
function handleTyping() {
    socket.emit('typing', { questionId: 'uuid-question-id', isTyping: true });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', {
            questionId: 'uuid-question-id',
            isTyping: false,
        });
    }, 3000);
}
```

**Data Format:**

```json
{
    "questionId": "uuid-question-id",
    "isTyping": true
}
```

---

### 2.6 Đánh dấu đã đọc realtime

**Event:** `mark_as_read`

**Frontend Code:**

```javascript
socket.emit(
    'mark_as_read',
    {
        questionId: 'uuid-question-id',
        messageId: 'uuid-message-id',
    },
    (acknowledgement) => {
        console.log('Mark as read response:', acknowledgement);
    },
);

// Lắng nghe message được đọc
socket.on('message_read', (data) => {
    console.log('Message read:', data);
    // Cập nhật UI để hiển thị message đã được đọc
});
```

**Data Format:**

```json
{
    "questionId": "uuid-question-id",
    "messageId": "uuid-message-id"
}
```

---

### 2.7 Lắng nghe tất cả server events

**Frontend Complete Setup:**

```javascript
import { io } from 'socket.io-client';

class ChatClient {
    constructor(token) {
        this.socket = io('/chat', {
            auth: { token: `Bearer ${token}` },
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => console.log('Connected'));
        this.socket.on('connected', (data) =>
            console.log('Server confirmed:', data),
        );
        this.socket.on('disconnect', () => console.log('Disconnected'));

        // Room events
        this.socket.on('joined_question', (data) =>
            console.log('Joined:', data),
        );
        this.socket.on('user_joined', (data) =>
            console.log('User joined:', data),
        );
        this.socket.on('user_left', (data) => console.log('User left:', data));

        // Message events
        this.socket.on('new_message', (message) =>
            this.handleNewMessage(message),
        );
        this.socket.on('message_read', (data) => this.handleMessageRead(data));

        // Typing events
        this.socket.on('typing_status', (data) =>
            this.handleTypingStatus(data),
        );

        // Question events
        this.socket.on('question_updated', (data) =>
            console.log('Question updated:', data),
        );
        this.socket.on('consultant_assigned', (data) =>
            console.log('Consultant assigned:', data),
        );
    }

    // Methods
    joinQuestion(questionId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('join_question', { questionId }, (ack) => {
                if (ack.status === 'success') resolve(ack);
                else reject(ack);
            });
        });
    }

    sendMessage(questionId, content, type = 'text') {
        return new Promise((resolve, reject) => {
            this.socket.emit(
                'send_message',
                { questionId, content, type },
                (ack) => {
                    if (ack.status === 'success') resolve(ack);
                    else reject(ack);
                },
            );
        });
    }

    setTyping(questionId, isTyping) {
        this.socket.emit('typing', { questionId, isTyping });
    }

    markAsRead(questionId, messageId) {
        this.socket.emit('mark_as_read', { questionId, messageId });
    }
}

// Usage
const chatClient = new ChatClient('your-jwt-token');
```

## 3. Frontend Testing Examples

### 3.1 Testing REST API với Postman/Thunder Client

**1. Tạo question mới:**

```bash
POST http://localhost:3000/api/chat/questions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Test Question",
  "content": "This is a test question for frontend integration",
}
```

**2. Gửi tin nhắn text:**

```bash
POST http://localhost:3000/api/chat/questions/{{questionId}}/messages
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Hello, this is a test message",
  "type": "text",
  "questionId": "{{questionId}}"
}
```

**3. Upload file:**

```bash
POST http://localhost:3000/api/chat/questions/{{questionId}}/messages/file
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

# Form data:
file: [select file]
content: "This is my test file"
type: "image"
```

---

### 3.2 Testing WebSocket với JavaScript

**HTML Test Page:**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Chat WebSocket Test</title>
        <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    </head>
    <body>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Type a message..." />
        <button onclick="sendMessage()">Send</button>
        <button onclick="joinRoom()">Join Room</button>
        <button onclick="leaveRoom()">Leave Room</button>

        <script>
            const token = 'your-jwt-token-here';
            const questionId = 'your-question-id-here';

            const socket = io('/chat', {
                auth: { token: `Bearer ${token}` },
            });

            // Event listeners
            socket.on('connect', () => {
                console.log('Connected to server');
                addMessage('Connected to server');
            });

            socket.on('connected', (data) => {
                console.log('Server confirmed connection:', data);
                addMessage(`Server confirmed: ${JSON.stringify(data)}`);
            });

            socket.on('new_message', (message) => {
                console.log('New message:', message);
                addMessage(`New message: ${message.data.content}`);
            });

            socket.on('user_joined', (data) => {
                addMessage(`User joined: ${JSON.stringify(data)}`);
            });

            socket.on('typing_status', (data) => {
                addMessage(`Typing: ${JSON.stringify(data)}`);
            });

            // Functions
            function joinRoom() {
                socket.emit('join_question', { questionId }, (ack) => {
                    console.log('Join response:', ack);
                    addMessage(`Join response: ${JSON.stringify(ack)}`);
                });
            }

            function leaveRoom() {
                socket.emit('leave_question', { questionId }, (ack) => {
                    console.log('Leave response:', ack);
                    addMessage(`Leave response: ${JSON.stringify(ack)}`);
                });
            }

            function sendMessage() {
                const input = document.getElementById('messageInput');
                const content = input.value.trim();

                if (!content) return;

                socket.emit(
                    'send_message',
                    {
                        questionId,
                        content,
                        type: 'text',
                    },
                    (ack) => {
                        console.log('Send message response:', ack);
                        addMessage(`Send response: ${JSON.stringify(ack)}`);
                    },
                );

                input.value = '';
            }

            function addMessage(message) {
                const div = document.createElement('div');
                div.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
                document.getElementById('messages').appendChild(div);
            }

            // Auto typing simulation
            document
                .getElementById('messageInput')
                .addEventListener('input', () => {
                    socket.emit('typing', { questionId, isTyping: true });

                    clearTimeout(window.typingTimeout);
                    window.typingTimeout = setTimeout(() => {
                        socket.emit('typing', { questionId, isTyping: false });
                    }, 1000);
                });
        </script>
    </body>
</html>
```

---

### 3.3 Testing với React/Next.js

**Install dependencies:**

```bash
npm install socket.io-client
npm install axios  # for REST API calls
```

**Chat Component Example:**

```javascript
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatComponent = ({ token, questionId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io('/chat', {
            auth: { token: `Bearer ${token}` },
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            // Auto join question room
            newSocket.emit('join_question', { questionId });
        });

        newSocket.on('new_message', (data) => {
            setMessages((prev) => [...prev, data.data]);
        });

        newSocket.on('typing_status', (data) => {
            if (data.isTyping) {
                setTypingUsers((prev) => [
                    ...prev.filter((u) => u !== data.userName),
                    data.userName,
                ]);
            } else {
                setTypingUsers((prev) =>
                    prev.filter((u) => u !== data.userName),
                );
            }
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token, questionId]);

    // Load message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await axios.get(
                    `/api/chat/questions/${questionId}/messages`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                setMessages(response.data.data.messages);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();
    }, [questionId, token]);

    const sendMessage = () => {
        if (!newMessage.trim() || !socket) return;

        socket.emit(
            'send_message',
            {
                questionId,
                content: newMessage,
                type: 'text',
            },
            (ack) => {
                if (ack.status === 'success') {
                    setNewMessage('');
                } else {
                    console.error('Failed to send message:', ack.message);
                }
            },
        );
    };

    const handleTyping = () => {
        if (!socket) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { questionId, isTyping: true });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing', { questionId, isTyping: false });
        }, 1000);
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('content', file.name);

        try {
            const response = await axios.post(
                `/api/chat/questions/${questionId}/messages/file`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            console.log('File uploaded:', response.data);
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((message) => (
                    <div key={message.id} className="message">
                        <strong>{message.senderName}:</strong> {message.content}
                        <span className="timestamp">
                            {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                ))}

                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.join(', ')} đang nhập...
                    </div>
                )}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onInput={handleTyping}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                />
                <button onClick={sendMessage}>Gửi</button>

                <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    accept="image/*,.pdf,.doc,.docx"
                />
            </div>
        </div>
    );
};

export default ChatComponent;
```

---

### 3.4 Testing Error Scenarios

**1. Test authentication errors:**

```javascript
// Kết nối không có token
const socket = io('/chat'); // Should fail

// Token không hợp lệ
const socket = io('/chat', {
    auth: { token: 'Bearer invalid-token' },
}); // Should fail with authentication error
```

**2. Test access control:**

```javascript
// Join question không có quyền
socket.emit(
    'join_question',
    {
        questionId: 'question-user-not-allowed',
    },
    (ack) => {
        // Should return error status
        console.log(ack); // { status: 'error', message: '...' }
    },
);
```

**3. Test rate limiting:**

```javascript
// Gửi nhiều message liên tiếp
for (let i = 0; i < 10; i++) {
    socket.emit('send_message', {
        questionId: 'test-question',
        content: `Message ${i}`,
        type: 'text',
    });
}
// Should be throttled after some requests
```

---

### 3.5 Environment Configuration

**Development:**

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';
```

**Production:**

```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
const SOCKET_URL = 'https://api.yourdomain.com';
```

**axios setup:**

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
});

// Request interceptor để tự động thêm token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## 4. Redis Integration & Technical Details

### 4.1 Redis Keys Pattern

```
chat:user:presence:{userId}     - User online status
chat:question:users:{questionId} - Users trong question room
chat:question:typing:{questionId} - Users đang typing
chat:user:rooms:{userId}        - Rooms mà user đã join
```

### 4.2 TTL Values

- User presence: 5 minutes (300 seconds)
- Question users: 1 hour (3600 seconds)
- Typing status: 10 seconds
- Individual typing: 5 seconds

### 4.3 Guards và Middleware

#### 4.3.1 WsJwtGuard

- Xác thực JWT token cho WebSocket
- Extract user info từ token
- Reject connection nếu token invalid

#### 4.3.2 WsRoomAccessGuard

- Kiểm tra quyền truy cập vào question room
- Verify user có thể join room hay không
- Dựa trên role và ownership của question

#### 4.3.3 RedisWsThrottleGuard

- Rate limiting cho WebSocket events
- Prevent spam và abuse
- Limits: 10 messages/minute per user

#### 4.3.4 RoleGuard (REST API)

- Kiểm tra role permissions
- Restrict access theo roles (CUSTOMER, CONSULTANT, ADMIN)

---

## 5. Error Handling & Status Codes

### 5.1 REST API Errors

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (không có token hoặc token invalid)
- `403` - Forbidden (không có quyền truy cập)
- `404` - Not Found (resource không tồn tại)
- `500` - Internal Server Error

**Error Response Format:**

```json
{
    "success": false,
    "message": "Error message in Vietnamese",
    "statusCode": 400,
    "error": "Bad Request",
    "details": {
        "field": "validation error details"
    }
}
```

### 5.2 WebSocket Errors

**Error Acknowledgements:**

```json
{
    "status": "error",
    "message": "Truy cập bị từ chối vào câu hỏi này",
    "questionId": "uuid-question-id",
    "timestamp": "2025-06-30T10:00:00.000Z"
}
```

**Common WebSocket Error Messages:**

- `"Người dùng chưa đăng nhập"` - Authentication required
- `"Truy cập bị từ chối vào câu hỏi này"` - Access denied to question
- `"Dữ liệu yêu cầu không hợp lệ"` - Invalid request data
- `"Đã xảy ra lỗi"` - Internal error

---

## 6. Security Features

### 6.1 Authentication & Authorization

**JWT Token Requirements:**

- Token phải được gửi trong header: `Authorization: Bearer <token>`
- Token phải valid và chưa expired
- User phải có role phù hợp với endpoint

**WebSocket Authentication:**

```javascript
const socket = io('/chat', {
    auth: {
        token: 'Bearer your-jwt-token-here',
    },
});
```

### 6.2 File Upload Security

**Allowed File Types:**

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`
- Max file size: 10MB (configurable)

**File Validation:**

- MIME type checking
- File extension validation
- Virus scanning (if configured)
- File size limits

### 6.3 Rate Limiting

**REST API Limits:**

- Global: 100 requests/minute per IP
- Per user: 60 requests/minute

**WebSocket Limits:**

- Message sending: 10 messages/minute per user
- Join/Leave room: 5 actions/minute per user
- Typing events: 30 events/minute per user

---

## 7. Performance & Monitoring

### 7.1 Caching Strategy

**Redis Caching:**

- User presence information
- Active room memberships
- Typing status với TTL tự động cleanup
- Message read status

### 7.2 Database Optimization

**Indexed Fields:**

- `messages.questionId`
- `messages.senderId`
- `messages.createdAt`
- `questions.customerId`

**Pagination:**

- Default: 20 messages per page
- Maximum: 100 messages per page
- Cursor-based pagination cho performance tốt

### 7.3 Monitoring Endpoints

**Health Check:**

```
GET /api/health
```

**Chat Health Check:**

```
GET /api/chat/health
```

Response:

```json
{
    "status": "ok",
    "database": "connected",
    "redis": "connected",
    "websocket": "active",
    "timestamp": "2025-06-30T10:00:00.000Z"
}
```

## 9. Troubleshooting Guide

### 9.1 Common Issues

**1. WebSocket Connection Failed**

```javascript
// Check browser console for errors
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

// Possible causes:
// - CORS not configured properly
// - JWT token expired/invalid
// - Server not running
// - Network/firewall issues
```

**2. Messages Not Appearing**

```javascript
// Debug steps:
// 1. Check if user joined the room
socket.emit('join_question', { questionId }, (ack) => {
    console.log('Join status:', ack.status);
});

// 2. Check message send acknowledgement
socket.emit('send_message', messageData, (ack) => {
    if (ack.status !== 'success') {
        console.error('Send failed:', ack.message);
    }
});

// 3. Verify event listeners
socket.on('new_message', (data) => {
    console.log('Received message:', data);
});
```

**3. File Upload Issues**

```javascript
// Check file size and type
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
    console.error('File too large');
    return;
}

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.type)) {
    console.error('File type not allowed');
    return;
}

---

## 10. API Reference Summary

### 10.1 REST Endpoints

| Method | Endpoint                                      | Description                | Auth Required |
| ------ | --------------------------------------------- | -------------------------- | ------------- |
| POST   | `/api/chat/questions`                         | Tạo question mới           | ✅ CUSTOMER   |
| POST   | `/api/chat/questions/:id/messages`            | Gửi text message           | ✅            |
| POST   | `/api/chat/questions/:id/messages/file`       | Upload file message        | ✅            |
| POST   | `/api/chat/questions/:id/messages/public-pdf` | Upload public PDF          | ✅            |
| GET    | `/api/chat/questions/:id/messages`            | Lấy message history        | ✅            |
| GET    | `/api/chat/questions/:id/messages/with-urls`  | Lấy messages với file URLs | ✅            |
| PATCH  | `/api/chat/messages/:id/read`                 | Đánh dấu message đã đọc    | ✅            |
| PATCH  | `/api/chat/questions/:id/messages/read-all`   | Đánh dấu tất cả đã đọc     | ✅            |
| DELETE | `/api/chat/messages/:id`                      | Xóa message                | ✅            |
| GET    | `/api/chat/questions/:id/summary`             | Lấy question summary       | ✅            |
| GET    | `/api/chat/messages/unread-count`             | Đếm tin nhắn chưa đọc      | ✅            |
| GET    | `/api/chat/messages/:id/file`                 | Download file              | ✅            |
| GET    | `/api/chat/questions`                         | Lấy danh sách questions    | ✅            |

### 10.2 WebSocket Events

**Client to Server:**

- `join_question` - Tham gia room
- `leave_question` - Rời room
- `send_message` - Gửi message
- `typing` - Thông báo typing
- `mark_as_read` - Đánh dấu đã đọc

**Server to Client:**

- `connected` - Xác nhận kết nối
- `joined_question` - Xác nhận join room
- `user_joined` - User khác join
- `user_left` - User khác rời room
- `new_message` - Message mới
- `message_read` - Message được đọc
- `typing_status` - Trạng thái typing
- `question_updated` - Question được cập nhật
- `consultant_assigned` - Được assign consultant

---

_Tài liệu này được cập nhật dựa trên code thực tế của chat module. Hãy thử nghiệm các example trên để đảm bảo tích hợp frontend thành công._
```
