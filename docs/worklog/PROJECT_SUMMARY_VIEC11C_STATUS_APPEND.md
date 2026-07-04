# PROJECT_SUMMARY append - Việc 11C Member Detail Polish

## Việc 11C — Chuẩn hóa tab con Member Detail

### Trạng thái

- Patch ready.
- Chờ apply và test.

### Phạm vi

Rà soát và chuẩn hóa layout/style cho các tab con trong hồ sơ học viên:

1. Tổng quan
2. Liên hệ
3. Phòng ở
4. Học tập
5. Tổ chức
6. Tài khoản

### Nội dung chính

- Gọn lại header/mô tả ở từng tab.
- Chuẩn hóa card/section để giảm cảm giác rối.
- Bổ sung mini stat tài khoản trong Tổng quan.
- Giữ đầy đủ thông tin cần thiết, không cắt nghiệp vụ.
- Tab Học tập được bọc lại để hạn chế kéo ngang modal cha.
- Lịch học vẫn giữ đủ Day/Week/Month, thêm/sửa/xóa, TimePicker.
- Không đổi backend, API, business rule.

### Rule bảo vệ

- Không làm mất rule date/time picker.
- Không làm hỏng layout JSX trong `MemberDetailModal.tsx`.
- Không đổi logic gán/chuyển/trả phòng, liên hệ, tổ chức, tài khoản.
- Không đụng OrgChart ở Organization module.
