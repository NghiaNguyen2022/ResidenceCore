# ResidenceCare - Local Development Setup Guide

**Hướng dẫn chạy ứng dụng trên máy local để test và phát triển**

---

## 📋 Yêu Cầu Hệ Thống

### Bắt Buộc

- **Node.js:** v18+ (khuyến nghị v22+)
- **pnpm:** v10+ (package manager)
- **MySQL/MariaDB:** v8.0+ hoặc TiDB
- **Git:** v2.0+

### Tùy Chọn

- **Docker:** Để chạy database trong container
- **VS Code:** Editor được khuyến nghị
- **Postman/Insomnia:** Để test API

---

## 🚀 Bước 1: Chuẩn Bị Môi Trường

### 1.1 Cài Đặt Node.js & pnpm

**macOS (sử dụng Homebrew):**
```bash
brew install node@22
brew install pnpm
```

**Windows (sử dụng Chocolatey):**
```bash
choco install nodejs
npm install -g pnpm
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

### 1.2 Kiểm Tra Phiên Bản

```bash
node --version    # v22.x.x
pnpm --version    # 10.x.x
npm --version     # 10.x.x
```

### 1.3 Cài Đặt MySQL (Nếu Chưa Có)

**macOS:**
```bash
brew install mysql@8.0
brew services start mysql@8.0
mysql -u root -p  # Nhập password
```

**Windows:**
- Download từ: https://dev.mysql.com/downloads/mysql/
- Chạy installer và follow hướng dẫn

**Linux (Ubuntu):**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

### 1.4 Tạo Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE residence_care;
CREATE USER 'residencecare'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON residence_care.* TO 'residencecare'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📦 Bước 2: Clone & Cài Đặt Project

### 2.1 Clone Repository

```bash
# Nếu chưa clone
git clone https://github.com/your-org/residence-care.git
cd residence-care

# Hoặc nếu đã có project
cd /path/to/residence-care
```

### 2.2 Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies
pnpm install

# Nếu có lỗi, thử xóa cache
pnpm store prune
pnpm install
```

**Thời gian:** ~3-5 phút (lần đầu)

---

## ⚙️ Bước 3: Cấu Hình Environment Variables

### 3.1 Tạo File .env.local

```bash
cp .env.example .env.local
```

### 3.2 Chỉnh Sửa .env.local

```bash
# Database
DATABASE_URL="mysql://residencecare:your_secure_password@localhost:3306/residence_care"

# JWT Secret (tạo random string)
JWT_SECRET="your-random-secret-key-min-32-characters"

# Manus OAuth (lấy từ Manus dashboard)
VITE_APP_ID="your-manus-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# Owner Info (thay đổi theo bạn)
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-manus-open-id"

# Manus API (dùng cho built-in services)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-api-key"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# App Title & Logo
VITE_APP_TITLE="ResidenceCare"
VITE_APP_LOGO="https://your-logo-url.png"
```

**Lưu ý:** 
- Không commit `.env.local` lên Git
- Giữ bí mật các API keys
- Để test local, có thể dùng giá trị dummy

---

## 🗄️ Bước 4: Thiết Lập Database

### 4.1 Tạo Tables

```bash
# Generate migrations từ schema
pnpm drizzle-kit generate

# Áp dụng migrations
pnpm drizzle-kit migrate
```

### 4.2 Kiểm Tra Database

```bash
mysql -u residencecare -p residence_care

# Xem các bảng
SHOW TABLES;

# Xem cấu trúc bảng
DESCRIBE users;
DESCRIBE residents;

# Thoát
EXIT;
```

### 4.3 Seed Data (Optional)

```bash
# Chạy seed script để thêm dữ liệu mẫu
node scripts/seed-db.mjs
```

---

## 🎯 Bước 5: Chạy Development Server

### 5.1 Khởi Động Server

```bash
# Terminal 1: Chạy backend + frontend dev server
pnpm dev
```

**Output mong đợi:**
```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

### 5.2 Truy Cập Ứng Dụng

Mở trình duyệt và truy cập:
```
http://localhost:3000
```

---

## 🧪 Bước 6: Test Ứng Dụng

### 6.1 Test Đăng Nhập

1. Click nút **"Đăng nhập"** (góc phải trên)
2. Nhập email Manus của bạn
3. Nhập mật khẩu
4. Xác nhận

**Nếu lỗi:** Kiểm tra `.env.local` OAuth settings

### 6.2 Test Các Tính Năng

**Resident Management:**
```bash
1. Vào Dashboard
2. Click "Cư dân"
3. Click "+ Thêm Cư dân"
4. Điền thông tin
5. Click "Lưu"
```

**Room Management:**
```bash
1. Click "Phòng ở"
2. Click "+ Thêm Phòng"
3. Điền số phòng, sức chứa
4. Click "Lưu"
```

**Attendance:**
```bash
1. Click "Điểm danh"
2. Click "+ Check-in"
3. Chọn cư dân
4. Chọn giờ
5. Click "Lưu"
```

### 6.3 Test API (Sử dụng Postman)

**Lấy Auth Token:**
```bash
# Kiểm tra session cookie
# Hoặc sử dụng OAuth flow
```

**Test Endpoint:**
```
GET http://localhost:3000/api/trpc/residents.list
```

---

## 🐛 Bước 7: Debug & Troubleshooting

### 7.1 Xem Logs

**Backend Logs:**
```bash
# Logs sẽ hiển thị trong terminal
# Tìm lỗi trong output
```

**Frontend Logs:**
```bash
# Mở DevTools (F12)
# Xem Console tab
# Xem Network tab để kiểm tra API calls
```

### 7.2 Lỗi Thường Gặp

**Lỗi 1: "Cannot find module"**
```bash
# Giải pháp
pnpm install
pnpm store prune
```

**Lỗi 2: "Database connection failed"**
```bash
# Kiểm tra MySQL chạy chưa
mysql -u root -p

# Kiểm tra DATABASE_URL trong .env.local
# Kiểm tra username/password
```

**Lỗi 3: "OAuth callback failed"**
```bash
# Kiểm tra VITE_APP_ID
# Kiểm tra OAUTH_SERVER_URL
# Kiểm tra redirect URL trong Manus dashboard
```

**Lỗi 4: "Port 3000 already in use"**
```bash
# Tìm process sử dụng port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### 7.3 Kiểm Tra Health

```bash
# Kiểm tra backend
curl http://localhost:3000/api/trpc/auth.me

# Kiểm tra database
mysql -u residencecare -p residence_care -e "SELECT COUNT(*) FROM users;"

# Kiểm tra dependencies
pnpm check
```

---

## ✏️ Bước 8: Chỉnh Sửa & Phát Triển

### 8.1 Cấu Trúc Thư Mục

```
residence-care/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Các trang
│   │   ├── components/    # Components
│   │   ├── App.tsx        # Routes
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                 # Backend (Express + tRPC)
│   ├── routers/           # tRPC routers
│   ├── services/          # Business logic
│   ├── db.ts              # Database queries
│   └── _core/             # Framework code
├── drizzle/               # Database schema
│   ├── schema.ts          # Table definitions
│   └── migrations/        # SQL migrations
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── package.json
```

### 8.2 Thêm Tính Năng Mới

**Ví dụ: Thêm endpoint mới**

1. **Cập nhật Schema** (`drizzle/schema.ts`):
```typescript
export const newTable = mysqlTable('new_table', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // ... other fields
});
```

2. **Generate Migration**:
```bash
pnpm drizzle-kit generate
```

3. **Apply Migration**:
```bash
pnpm drizzle-kit migrate
```

4. **Thêm Query Helper** (`server/db.ts`):
```typescript
export async function getNewItems() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(newTable);
}
```

5. **Thêm tRPC Procedure** (`server/routers/new.ts`):
```typescript
import { publicProcedure, router } from '../_core/trpc';

export const newRouter = router({
  list: publicProcedure.query(async () => {
    return await getNewItems();
  }),
});
```

6. **Register Router** (`server/routers.ts`):
```typescript
export const appRouter = router({
  // ... other routers
  new: newRouter,
});
```

7. **Sử dụng trong Frontend** (`client/src/pages/New.tsx`):
```typescript
const { data } = trpc.new.list.useQuery();
```

### 8.3 Chỉnh Sửa UI

**Thay đổi màu sắc:**
- Edit `client/src/index.css`
- Tìm `@layer base` section
- Thay đổi CSS variables

**Thêm trang mới:**
1. Tạo file `client/src/pages/NewPage.tsx`
2. Thêm route trong `client/src/App.tsx`
3. Thêm menu item trong sidebar

**Thay đổi theme:**
- Edit `ThemeProvider` trong `client/src/App.tsx`
- Thay đổi `defaultTheme="light"` thành `"dark"`

---

## 🧪 Bước 9: Chạy Tests

### 9.1 Chạy Unit Tests

```bash
# Chạy tất cả tests
pnpm test

# Chạy test file cụ thể
pnpm test server/routers.test.ts

# Watch mode (tự động chạy lại khi file thay đổi)
pnpm test --watch
```

### 9.2 Viết Test Mới

**Ví dụ test** (`server/routers.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('residents.list', () => {
  it('should return empty list initially', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.residents.list();
    expect(result).toEqual([]);
  });
});
```

---

## 📝 Bước 10: Commit & Push Changes

### 10.1 Git Workflow

```bash
# Xem thay đổi
git status

# Thêm files
git add .

# Commit
git commit -m "feat: add new feature description"

# Push
git push origin main
```

### 10.2 Commit Message Convention

```
feat: thêm tính năng mới
fix: sửa bug
docs: cập nhật tài liệu
style: thay đổi format code
refactor: cấu trúc lại code
test: thêm test
chore: cập nhật dependencies
```

---

## 🚀 Bước 11: Build Production

### 11.1 Build Frontend

```bash
pnpm build
```

**Output:** `dist/` folder chứa static files

### 11.2 Build Backend

```bash
pnpm build
```

**Output:** `dist/index.js` - production server

### 11.3 Test Production Build

```bash
# Build
pnpm build

# Start production server
NODE_ENV=production node dist/index.js
```

---

## 📋 Checklist Trước Deploy

- [ ] Tất cả tests pass (`pnpm test`)
- [ ] Không có TypeScript errors (`pnpm check`)
- [ ] Tất cả features test local
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Logs checked, no errors
- [ ] Security review done
- [ ] Performance tested

---

## 💡 Tips & Tricks

### Tăng Tốc Development

```bash
# Chỉ chạy frontend (nếu backend chạy riêng)
pnpm dev:client

# Chỉ chạy backend
pnpm dev:server

# Format code tự động
pnpm format

# Check type errors
pnpm check
```

### Debug Mode

```bash
# Chạy với debug logs
DEBUG=* pnpm dev

# Chạy backend với debugger
node --inspect-brk dist/index.js
```

### Reset Database

```bash
# Drop tất cả tables
mysql -u residencecare -p residence_care < /dev/null

# Recreate tables
pnpm drizzle-kit migrate

# Seed data
node scripts/seed-db.mjs
```

---

## 📞 Cần Giúp?

**Kiểm tra:**
1. Xem logs trong terminal
2. Mở DevTools (F12) xem console
3. Kiểm tra `.env.local` settings
4. Kiểm tra MySQL chạy chưa

**Liên Hệ:**
- Email: support@residencecare.vn
- Docs: `/home/ubuntu/residence-care/docs/`

---

**Happy Coding! 🚀**

Nếu gặp vấn đề gì, hãy liên hệ hoặc kiểm tra documentation.
