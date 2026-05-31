# ResidenceCare - Windows + VS Code Setup Guide

**Hướng dẫn chi tiết chạy ResidenceCare trên Windows với VS Code**

---

## 📋 Yêu Cầu Hệ Thống

- **Windows:** 10/11 (64-bit)
- **Node.js:** v18+ (khuyến nghị v22+)
- **pnpm:** v10+
- **MySQL:** v8.0+ (hoặc MariaDB)
- **VS Code:** Latest version
- **Internet:** Để tải dependencies

---

## 🔧 BƯỚC 1: Cài Đặt Node.js & pnpm

### 1.1 Cài Đặt Node.js

**Cách 1: Download từ Website (Khuyến nghị)**

1. Truy cập: https://nodejs.org/
2. Click **"LTS"** (Long Term Support) - v20 hoặc v22
3. Download file `.msi` (Windows Installer)
4. Chạy installer:
   - Click **Next** → Next → Next
   - ✅ Chọn **"Automatically install the necessary tools"**
   - Click **Install**
   - Đợi ~5 phút
   - Click **Finish**

**Cách 2: Sử dụng Chocolatey (nếu đã cài)**

```powershell
choco install nodejs
```

### 1.2 Kiểm Tra Node.js & npm

Mở **PowerShell** hoặc **Command Prompt** (Win + R, gõ `cmd`):

```cmd
node --version
npm --version
```

**Kết quả mong đợi:**
```
v22.x.x
10.x.x
```

### 1.3 Cài Đặt pnpm

Trong PowerShell/Command Prompt:

```cmd
npm install -g pnpm
```

Kiểm tra:
```cmd
pnpm --version
```

**Kết quả mong đợi:**
```
10.x.x
```

---

## 🗄️ BƯỚC 2: Cài Đặt MySQL

### 2.1 Download MySQL

1. Truy cập: https://dev.mysql.com/downloads/mysql/
2. Chọn **Windows (x86, 64-bit), MSI Installer**
3. Click **Download** (không cần đăng ký)

### 2.2 Chạy MySQL Installer

1. Chạy file `mysql-installer-community-8.0.x-winx64.msi`
2. Click **Next**
3. Chọn **Setup Type:**
   - ✅ **Server only** (đơn giản nhất)
   - Click **Next**
4. **MySQL Server Configuration:**
   - Port: `3306` (mặc định)
   - Click **Next**
5. **MySQL Server - Type and Networking:**
   - ✅ **Development Machine** (mặc định)
   - Click **Next**
6. **Authentication Method:**
   - ✅ **Use Legacy Authentication Plugin** (dễ kết nối)
   - Click **Next**
7. **Accounts and Roles:**
   - **MySQL Root Password:** Nhập password mạnh (VD: `Root@123456`)
   - **Confirm Password:** Nhập lại
   - Click **Next**
8. **Windows Service:**
   - ✅ **Configure MySQL Server as a Windows Service**
   - ✅ **Start the MySQL Server at System Startup**
   - Click **Next**
9. **Execute Configuration:**
   - Click **Execute**
   - Đợi ~2 phút
   - Click **Finish**

### 2.3 Kiểm Tra MySQL

Mở **Command Prompt** (Win + R, gõ `cmd`):

```cmd
mysql -u root -p
```

Nhập password bạn vừa tạo (VD: `Root@123456`)

**Nếu thành công, bạn sẽ thấy:**
```
mysql>
```

Gõ `EXIT;` để thoát:
```cmd
EXIT;
```

---

## 💾 BƯỚC 3: Tạo Database & User

### 3.1 Mở MySQL Command Line

```cmd
mysql -u root -p
```

Nhập password root.

### 3.2 Tạo Database

Gõ lệnh sau (lưu ý dấu `;` ở cuối):

```sql
CREATE DATABASE residence_care;
```

Kết quả:
```
Query OK, 1 row affected
```

### 3.3 Tạo User & Cấp Quyền

```sql
CREATE USER 'residencecare'@'localhost' IDENTIFIED BY 'ResidenceCare@123';
```

```sql
GRANT ALL PRIVILEGES ON residence_care.* TO 'residencecare'@'localhost';
```

```sql
FLUSH PRIVILEGES;
```

### 3.4 Kiểm Tra

```sql
SELECT user, host FROM mysql.user WHERE user='residencecare';
```

**Kết quả mong đợi:**
```
+-----------------+-----------+
| user            | host      |
+-----------------+-----------+
| residencecare   | localhost |
+-----------------+-----------+
```

### 3.5 Thoát MySQL

```sql
EXIT;
```

---

## 📦 BƯỚC 4: Chuẩn Bị Project

### 4.1 Giải Nén Project

1. Tìm file `residence-care-complete.zip` bạn đã tải
2. **Chuột phải** → **Extract All...**
3. Chọn vị trí (VD: `C:\Users\YourName\Documents\`)
4. Click **Extract**

### 4.2 Mở Project với VS Code

1. Mở **VS Code**
2. **File** → **Open Folder**
3. Chọn thư mục `residence-care` vừa giải nén
4. Click **Select Folder**

**VS Code sẽ hiển thị:**
```
RESIDENCE-CARE
├── client/
├── server/
├── drizzle/
├── docs/
├── package.json
└── ...
```

### 4.3 Mở Terminal trong VS Code

**Ctrl + `** (backtick) hoặc **View** → **Terminal**

Terminal sẽ mở ở dưới cùng màn hình.

---

## ⚙️ BƯỚC 5: Cấu Hình Environment Variables

### 5.1 Tạo File .env.local

Trong VS Code:

1. **Chuột phải** vào thư mục gốc (residence-care)
2. **New File**
3. Gõ tên: `.env.local`
4. Press **Enter**

### 5.2 Điền Cấu Hình

Copy & paste vào file `.env.local`:

```env
# Database Configuration
DATABASE_URL="mysql://residencecare:ResidenceCare@123@localhost:3306/residence_care"

# JWT Secret (tạo random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-for-security"

# Manus OAuth Configuration
VITE_APP_ID="your-manus-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# Owner Information
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-manus-open-id"

# Manus API Keys
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-api-key"

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# App Configuration
VITE_APP_TITLE="ResidenceCare"
VITE_APP_LOGO="https://your-logo-url.png"
```

### 5.3 Chỉnh Sửa Giá Trị

**Quan trọng nhất:**

1. **DATABASE_URL** - Đã đúng (residencecare:ResidenceCare@123)
2. **JWT_SECRET** - Giữ nguyên (random string)
3. **VITE_APP_ID** - Lấy từ Manus dashboard (xem Bước 6)
4. **OWNER_OPEN_ID** - Lấy từ Manus profile

**Lưu file:** Ctrl + S

---

## 🔐 BƯỚC 6: Cấu Hình Manus OAuth (Authentication)

### 6.1 Tạo Manus Account

1. Truy cập: https://manus.im
2. Click **Sign Up**
3. Nhập email, password
4. Xác nhận email
5. Đăng nhập

### 6.2 Tạo OAuth Application

1. Vào **Dashboard** → **Settings** → **Applications**
2. Click **Create New Application**
3. Điền thông tin:
   - **App Name:** `ResidenceCare Local`
   - **Redirect URI:** `http://localhost:3000/api/oauth/callback`
   - **Description:** `Local development`
4. Click **Create**

### 6.3 Lấy Credentials

Sau khi tạo, bạn sẽ thấy:
- **App ID** (VITE_APP_ID)
- **App Secret** (không cần cho local)

### 6.4 Cập Nhật .env.local

Mở `.env.local` và thay:
```env
VITE_APP_ID="your-app-id-here"
OWNER_OPEN_ID="your-open-id-here"
```

Lấy **Open ID** từ Manus Profile:
1. Click avatar (góc phải trên)
2. **Profile Settings**
3. Tìm **Open ID**
4. Copy & paste vào `.env.local`

**Lưu file:** Ctrl + S

---

## 📥 BƯỚC 7: Cài Đặt Dependencies

### 7.1 Trong Terminal VS Code

```cmd
pnpm install
```

**Điều này sẽ:**
- Tải tất cả packages từ npm
- Cài đặt React, Express, Drizzle, v.v.
- Thời gian: ~5-10 phút (tùy tốc độ internet)

**Kết quả mong đợi:**
```
added XXX packages in X.XXs
```

### 7.2 Nếu Gặp Lỗi

```cmd
pnpm store prune
pnpm install
```

---

## 🗄️ BƯỚC 8: Thiết Lập Database

### 8.1 Tạo Tables

```cmd
pnpm drizzle-kit generate
```

**Kết quả:**
```
Drizzle Studio is available at ...
```

### 8.2 Áp Dụng Migrations

```cmd
pnpm drizzle-kit migrate
```

**Kết quả:**
```
✓ Migrations applied
```

### 8.3 Kiểm Tra Database

Mở Command Prompt:

```cmd
mysql -u residencecare -p residence_care
```

Nhập password: `ResidenceCare@123`

Xem các bảng:
```sql
SHOW TABLES;
```

**Bạn sẽ thấy 16 bảng:**
```
+----------------------------+
| Tables_in_residence_care   |
+----------------------------+
| users                      |
| residents                  |
| rooms                      |
| schools                    |
| programs                   |
| attendance                 |
| schedules                  |
| taskTypes                  |
| taskAssignments            |
| feeTypes                   |
| debts                      |
| payments                   |
| notifications              |
| cronJobLogs                |
+----------------------------+
```

Thoát:
```sql
EXIT;
```

---

## 🚀 BƯỚC 9: Chạy Development Server

### 9.1 Trong Terminal VS Code

```cmd
pnpm dev
```

**Đợi ~30 giây, bạn sẽ thấy:**

```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

**Lưu ý:** Nếu thấy lỗi CSS (border-border), không sao - ứng dụng vẫn chạy bình thường.

### 9.2 Truy Cập Ứng Dụng

Mở trình duyệt (Chrome, Edge, Firefox):

```
http://localhost:3000
```

**Bạn sẽ thấy trang Home với:**
- Logo "RC" (ResidenceCare)
- Tiêu đề "Quản lý lưu xá thông minh"
- Nút "Đăng nhập"
- Nút "Xem demo"

---

## 🔑 BƯỚC 10: Đăng Nhập

### 10.1 Click Nút "Đăng Nhập"

1. Trên trang Home, click nút **"Đăng nhập"** (góc phải trên)
2. Bạn sẽ được chuyển đến trang Manus login

### 10.2 Nhập Thông Tin

- **Email:** Email Manus của bạn
- **Password:** Password Manus
- Click **Sign In**

### 10.3 Cấp Quyền

Manus sẽ hỏi cấp quyền truy cập:
- ✅ Chọn tất cả quyền
- Click **Allow**

### 10.4 Chuyển Hướng Về Ứng Dụng

Bạn sẽ được chuyển về `http://localhost:3000/dashboard`

**Chúc mừng! Bạn đã đăng nhập thành công! 🎉**

---

## 🧪 BƯỚC 11: Test Các Tính Năng

### 11.1 Dashboard

Bạn sẽ thấy:
- Tổng số cư dân: 0
- Sức chứa phòng: 0/0
- Điểm danh hôm nay: 0%
- Công việc chờ: 0
- Công nợ chưa thanh toán: 0 VND

### 11.2 Thêm Cư Dân

1. Click menu **"Cư dân"** (sidebar trái)
2. Click nút **"+ Thêm Cư dân"**
3. Điền thông tin:
   - **Họ tên:** Nguyễn Văn A
   - **Email:** nguyenvana@example.com
   - **Số điện thoại:** 0901234567
   - **Ngày sinh:** 01/01/2005
   - **Giới tính:** Nam
   - **Trường học:** (chọn hoặc để trống)
   - **Chương trình học:** (chọn hoặc để trống)
   - **Phòng ở:** (chọn hoặc để trống)
4. Click **"Lưu"**

**Kết quả:** Cư dân được thêm vào danh sách

### 11.3 Thêm Phòng

1. Click menu **"Phòng ở"**
2. Click **"+ Thêm Phòng"**
3. Điền:
   - **Số phòng:** 101
   - **Sức chứa:** 4
   - **Mô tả:** Phòng ở tầng 1
4. Click **"Lưu"**

### 11.4 Gán Cư Dân Vào Phòng

1. Quay lại **"Cư dân"**
2. Click cư dân vừa tạo
3. Chọn **Phòng ở:** 101
4. Click **"Lưu"**

### 11.5 Ghi Nhận Điểm Danh

1. Click menu **"Điểm danh"**
2. Click **"+ Check-in"**
3. Chọn cư dân
4. Chọn giờ (VD: 08:00)
5. Click **"Lưu"**

---

## 🛠️ BƯỚC 12: Debug & Troubleshooting

### 12.1 Xem Logs

**Backend Logs:**
- Xem trong Terminal VS Code
- Tìm lỗi trong output

**Frontend Logs:**
- Mở DevTools: **F12**
- Xem tab **Console**
- Xem tab **Network** để kiểm tra API calls

### 12.2 Lỗi Thường Gặp

**Lỗi 1: "Port 3000 already in use"**

```cmd
netstat -ano | findstr :3000
```

Tìm PID, sau đó:

```cmd
taskkill /PID <PID> /F
```

Chạy lại: `pnpm dev`

**Lỗi 2: "Cannot connect to database"**

Kiểm tra:
1. MySQL đang chạy không?
   ```cmd
   mysql -u residencecare -p residence_care
   ```
2. DATABASE_URL trong .env.local đúng không?
3. Password đúng không?

**Lỗi 3: "OAuth callback failed"**

Kiểm tra:
1. VITE_APP_ID đúng không?
2. Redirect URI trong Manus dashboard có `http://localhost:3000/api/oauth/callback` không?

**Lỗi 4: "TypeScript errors"**

```cmd
pnpm check
```

Xem chi tiết lỗi.

### 12.3 Restart Server

Nếu gặp lỗi lạ:

1. Trong Terminal VS Code: **Ctrl + C** (dừng server)
2. Chạy lại: `pnpm dev`

---

## 💾 BƯỚC 13: Seed Data (Optional)

Để thêm dữ liệu mẫu:

```cmd
node scripts/seed-db.mjs
```

**Kết quả:**
```
✓ Seeded 10 residents
✓ Seeded 5 rooms
✓ Seeded 3 schools
```

---

## ✏️ BƯỚC 14: Chỉnh Sửa Code

### 14.1 Cấu Trúc Project

```
residence-care/
├── client/src/
│   ├── pages/          # Các trang (Home, Dashboard, etc.)
│   ├── components/     # UI components
│   ├── App.tsx         # Routes
│   └── index.css       # Styles
├── server/
│   ├── routers/        # tRPC routers
│   ├── db.ts           # Database queries
│   └── services/       # Business logic
├── drizzle/
│   └── schema.ts       # Database schema
└── package.json
```

### 14.2 Thay Đổi Màu Sắc

1. Mở `client/src/index.css`
2. Tìm `@layer base`
3. Thay đổi CSS variables:
   ```css
   --background: 60 30% 97%;      /* Cream color */
   --foreground: 20 10% 20%;      /* Dark text */
   --primary: 45 96% 56%;         /* Golden */
   ```
4. **Lưu:** Ctrl + S
5. Ứng dụng sẽ tự reload

### 14.3 Thêm Tính Năng Mới

**Ví dụ: Thêm endpoint mới**

1. Cập nhật schema (`drizzle/schema.ts`)
2. Generate migration: `pnpm drizzle-kit generate`
3. Apply: `pnpm drizzle-kit migrate`
4. Thêm query helper (`server/db.ts`)
5. Thêm tRPC procedure (`server/routers/new.ts`)
6. Register router (`server/routers.ts`)
7. Sử dụng trong UI (`client/src/pages/New.tsx`)

---

## 🧪 BƯỚC 15: Chạy Tests

```cmd
pnpm test
```

**Kết quả:**
```
✓ server/routers.test.ts (3 tests)
✓ server/auth.logout.test.ts (1 test)

4 passed
```

---

## 📝 BƯỚC 16: Build Production

```cmd
pnpm build
```

**Kết quả:**
```
✓ built in XXX ms
```

Tạo thư mục `dist/` chứa:
- `dist/index.js` - Backend
- `dist/client/` - Frontend

---

## 🎯 Checklist Hoàn Thành

- [ ] Node.js v18+ cài đặt
- [ ] pnpm v10+ cài đặt
- [ ] MySQL 8.0+ cài đặt & chạy
- [ ] Database `residence_care` tạo
- [ ] User `residencecare` tạo
- [ ] Project giải nén
- [ ] VS Code mở project
- [ ] `.env.local` tạo & cấu hình
- [ ] Manus OAuth app tạo
- [ ] `pnpm install` chạy thành công
- [ ] `pnpm drizzle-kit migrate` chạy thành công
- [ ] `pnpm dev` chạy thành công
- [ ] Truy cập `http://localhost:3000` thành công
- [ ] Đăng nhập thành công
- [ ] Thêm cư dân thành công
- [ ] Thêm phòng thành công

---

## 📞 Cần Giúp?

**Kiểm tra:**
1. Xem logs trong Terminal VS Code
2. Mở DevTools (F12) xem console
3. Kiểm tra `.env.local` settings
4. Kiểm tra MySQL chạy: `mysql -u root -p`

**Liên Hệ:**
- Email: support@residencecare.vn
- Docs: `/docs/` folder trong project

---

**Chúc bạn thành công! Happy coding! 🚀**

Nếu gặp vấn đề ở bước nào, hãy cho tôi biết chi tiết lỗi, tôi sẽ giúp bạn!
