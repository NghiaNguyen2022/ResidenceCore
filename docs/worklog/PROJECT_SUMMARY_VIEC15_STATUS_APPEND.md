# PROJECT SUMMARY APPEND — VIỆC 15

> Append-only. Nội dung này dùng để ghi thêm vào `PROJECT_SUMMARY.md`, không thay thế phần cũ.

## Việc 15 — Portal học viên mở rộng / gom trải nghiệm học viên

### Bối cảnh
Sau các việc 11–14, hệ thống đã có nền vận hành cho học viên, phòng ở, học tập, tổ chức, công tác, tài chính, thông báo và hoạt động/sự kiện. Việc 15 tập trung gom lại trải nghiệm phía học viên để demo một vòng đầy đủ trên portal.

### 15A — Portal activities route
- Đã chuẩn bị patch thêm route `/resident/activities` trong `client/src/App.tsx`.
- Mục tiêu: menu Hoạt động trên portal mở đúng trang hoạt động công khai, không NotFound.

### 15B — Portal Today premium polish
- Đã chuẩn bị patch UI cho `client/src/pages/ResidentToday.tsx`.
- Trang Hôm nay của portal được bám style chung hệ thống/FinanceLite bằng `residenceMediumStyle`.
- Header, summary cards, lịch học, công tác hôm nay, scope vai trò, loading/error/empty states được đổi sang tone premium trắng/kem/amber nhẹ.
- Không thay đổi API, backend, schema, navigation hoặc logic hoàn thành công tác.

### Ghi chú bảo vệ
- Tracking Việc 15 phải append-only/full-history.
- Các file portal user đã gửi trong Việc 15 được xem là base hiện tại nếu user không nói đã thay đổi.
- Không revert các patch đã pass của Việc 12, 13, 14.

---

## 2026-07-12 — Việc 15C: Portal Today visible premium restyle

Sau 15B, user phản hồi trang `/resident/today` chưa thấy thay đổi rõ về style. Tiếp tục patch 15C để restyle mạnh hơn nhưng vẫn giữ scope UI-only.

Thay đổi:
- `client/src/pages/ResidentToday.tsx`
- Bỏ phụ thuộc trực tiếp vào `residenceMediumStyle` ở trang này để chủ động tạo hero portal premium rõ hơn.
- Header đổi sang hero centered với nền radial trắng-kem-amber, badge Portal học viên, ngày hiện tại làm title chính.
- Resident info chuyển thành chip gọn dưới hero.
- Summary cards đổi sang premium gold cards, giống nhịp Finance hơn.
- Lịch học/Công tác/Vai trò đổi sang panel gradient trắng-kem, ring amber, shadow mềm.

Không đổi:
- Không đổi API/router/service/schema.
- Không đổi logic công tác cá nhân/phòng/tổ/ban.
- Không đổi mark complete duty.
- Không đổi navigation.

Trạng thái: PATCH READY, chờ user apply/test.

---

## 2026-07-12 — Việc 15C PASS

User xác nhận `15C pass` sau khi apply patch Portal Today visible premium restyle.

Trạng thái:
- 15A: đã chuẩn bị route portal activities.
- 15B: polish nhẹ, chưa tạo thay đổi style đủ rõ theo phản hồi user.
- 15C: PASS, được xem là base hiện tại cho trang `/resident/today`.

Kết quả 15C:
- Trang Hôm nay của portal học viên đã chuyển sang style premium rõ hơn.
- Hero, summary cards, panel Lịch học/Công tác/Vai trò có nhận diện trắng/kem/amber rõ hơn.
- Không đổi API/backend/schema/navigation/logic hoàn thành công tác.

Bước tiếp theo đề xuất:
- 15D — Chuẩn hóa/Polish `Công tác của tôi` (`/my-duties` hoặc route portal tương ứng) theo style portal mới, bảo toàn logic công tác cá nhân/phòng/tổ/ban đã pass ở Việc 12C.


---

## Việc 15D — MyDuties / Công tác của tôi premium polish

**Trạng thái:** PATCH READY.

Sau khi Việc 15C đã pass cho Portal Today, tiếp tục chuẩn hóa trang `MyDuties.tsx` để cùng ngôn ngữ UI với portal premium: hero centered, nền trắng/kem/amber, summary cards, quick filters và duty cards compact.

Không thay đổi backend/API/schema/navigation và không phá logic Việc 12C về công tác theo cá nhân/phòng/tổ/ban.
