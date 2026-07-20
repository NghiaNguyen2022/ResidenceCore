# Gói áp dụng 16L3 + 16L4

Cách dùng:

1. Giải nén toàn bộ gói vào thư mục gốc ResidenceCore.
2. Chạy `APPLY_16L3_16L4.bat`.
3. Chạy:
   `pnpm check`
   `pnpm dev`
4. Commit các file đã thay đổi.

Gói tự:
- kiểm tra đúng thư mục dự án;
- backup 4 file hiện tại;
- copy file service hoàn chỉnh;
- áp dụng patch 16L3;
- áp dụng patch 16L4;
- hiển thị `git status`.

Trạng thái runtime:
- 16L3: chưa runtime test vì ngoài giờ ca.
- 16L4: chưa runtime test.


Bản FIX: xử lý trường hợp gói được giải nén trực tiếp vào thư mục gốc, tránh lỗi copy file lên chính nó.
