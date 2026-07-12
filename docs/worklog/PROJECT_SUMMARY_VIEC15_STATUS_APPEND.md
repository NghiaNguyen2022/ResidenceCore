# PROJECT_SUMMARY_VIEC15_STATUS_APPEND

## Việc 15 — Portal học viên mở rộng

### Các bước đã đi qua
- 15A: thêm route `/resident/activities` để menu Hoạt động trên portal không NotFound.
- 15B: polish nhẹ Portal Today nhưng chưa đủ khác biệt.
- 15C: restyle Portal Today theo premium style, user xác nhận pass.
- 15D: polish MyDuties nhưng chưa chốt do route/menu chưa rõ.
- 15E: gọn menu Portal học viên bước đầu, user xác nhận pass.
- 15F: gom tiếp menu thành `Hôm nay` + `Lưu xá của tôi` + `Phụ trách`, user xác nhận pass.
- 15G: chuẩn hóa Công tác trong menu mới, user báo done/tiếp tục.
- 15H: rà Tài chính của tôi và đổi field Ngày chi sang shared FormDateInput để tuân thủ rule picker.

### 15I — Format tiền tệ field nhập số tiền trong Portal Finance
- Sửa `client/src/pages/ResidentFinance.tsx`.
- Field `Số tiền thực chi` trong modal Cập nhật chi thực tế hiển thị theo format tiền tệ Việt Nam khi nhập, ví dụ `1.000.000`.
- Khi submit, giá trị được parse về number để giữ nguyên payload backend.
- Không đổi backend/API/schema/logic tài chính.
- Giữ rule protected: date/time/datetime phải dùng picker shared.
