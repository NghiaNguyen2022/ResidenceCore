# 16L8.15 — Ca chiều, cấp mã và timeout phiên Cửa hàng

## Luồng sau khi sửa

### 1. Cấp mã
- Khi học viên mở trang Công tác trong giờ ca và ca chưa có mã, backend tự tạo mã.
- Mã được gửi qua Thông báo.
- Quản lý vẫn có thể bấm `Gửi mã qua Thông báo` trong chi tiết công tác để cấp lại.
- Cấp lại luôn thu hồi session/mã cũ trước khi tạo mã mới.

### 2. Timeout 30 phút
- Chỉ phiên thao tác Cửa hàng bị timeout.
- Không đăng xuất portal học viên.
- Popup xuất hiện ngay trong trang Cửa hàng.
- Học viên nhập lại mã ca hiện tại để mở phiên mới.
- Mã cũ vẫn dùng được sau timeout, miễn là ca chưa kết thúc và quản lý chưa cấp lại mã.

### 3. Hết giờ ca
- Session chuyển `expired`.
- Token và mã không thể mở lại.
- Học viên được đưa về trang Công tác.
- Ca sáng và ca chiều dùng chung logic theo `accessValidUntil`.

## File
- `server/services/storeDutyAccessService.ts`: file hoàn chỉnh.
- `client/src/pages/ResidentStore.tsx.patch`: patch frontend theo Git hiện tại.

## Áp dụng
1. Replace file backend.
2. Chạy patch frontend:

```bash
git apply --whitespace=fix client/src/pages/ResidentStore.tsx.patch
pnpm check
pnpm dev
```

## Test ca chiều
1. Phân công học viên vào ca chiều.
2. Đăng nhập học viên và mở Công tác trong giờ ca.
3. Kiểm tra Thông báo có mã tự động.
4. Vào Cửa hàng bằng mã.
5. Có thể dùng SQL tạm để đặt `lastStoreActivityAt` lùi hơn 30 phút rồi reload.
6. Popup timeout phải hiện và nhập lại cùng mã phải vào được.
7. Sau giờ ca, nhập mã phải bị từ chối.
