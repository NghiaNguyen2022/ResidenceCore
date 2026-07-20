# Quy tắc quản trị tiến độ

Mỗi patch phải có:
1. Files changed
2. Business impact
3. Regression risks
4. Checklist updated
5. PROJECT_SUMMARY updated
6. Test steps
7. Remaining work

Không được:
- Gửi code nhưng không cập nhật checklist
- Đánh dấu hoàn thành khi chưa test
- Ghi đè summary bằng bản cũ
- Đổi quyết định nghiệp vụ mà không ghi lịch sử
- Dùng code cũ làm base sau khi có patch mới

Nguồn sự thật:
1. Code mới nhất đã PASS
2. Quyết định mới nhất người dùng xác nhận
3. `PROJECT_SUMMARY.md`
4. `docs/MASTER_CHECKLIST.md`
5. BPD mới nhất
