# RESIDENCECORE CHECKLIST - VIỆC 15 IN PROGRESS

> Tracking append-only/full-history. Không ghi đè các nội dung đã ghi trước đó.

## Việc 15 — Portal học viên mở rộng / gom trải nghiệm học viên

### Mục tiêu tổng
- Học viên đăng nhập và xem được đầy đủ thông tin liên quan đến mình: hồ sơ, phòng ở, lịch học, công tác, tài chính, thông báo, hoạt động công khai.
- Học viên có chức vụ thấy thêm phạm vi Tổ/Ban phù hợp.
- UI/UX portal gọn, premium, cùng style hệ thống.

---

## 15A — Portal activities route
- Trạng thái: Đã chuẩn bị patch.
- Nội dung: thêm route `/resident/activities` trong `App.tsx` để menu Hoạt động trên portal không vào NotFound.
- Chờ user xác nhận runtime pass.

---

## 15B — Portal Today premium polish
- Trạng thái: Đã chuẩn bị patch.
- File ảnh hưởng: `client/src/pages/ResidentToday.tsx`.
- Nội dung:
  - Bám style chung qua `residenceMediumStyle` giống FinanceLite.
  - Nền page dùng page aura/standard content.
  - Header Hôm nay đổi sang standard header premium.
  - Summary cards, lịch học, công tác, scope vai trò đổi sang card trắng/kem/amber nhẹ.
  - Empty/loading/error state cùng tone hệ thống.
  - Không đổi API/backend/schema/navigation.
  - Không đổi logic hoàn thành công tác.

### Runtime cần test 15B
- [ ] Login resident mở `/resident/today`.
- [ ] Header, summary cards, lịch học, công tác nhìn gọn và premium hơn.
- [ ] Không có scroll ngang, không vỡ layout mobile/desktop.
- [ ] Công tác hôm nay vẫn hiển thị đủ cá nhân/phòng/tổ/ban.
- [ ] Nút hoàn thành công tác vẫn hoạt động.
- [ ] Role/scope duties vẫn hiển thị đúng cho Tổ trưởng/Trưởng ban.

---

## Việc 15C — Portal Today visible premium restyle

Ngày cập nhật: 2026-07-12
Trạng thái: PATCH READY

Lý do:
- User phản hồi 15B chưa thấy thay đổi rõ về style.
- Cần chuyển /resident/today sang style premium rõ hơn, bám Finance/DailyRoutine nhưng vẫn gọn cho portal học viên.

Phạm vi:
- client/src/pages/ResidentToday.tsx

Checklist:
- [x] Không đổi backend/API/schema/navigation.
- [x] Không đổi logic completeTodayDuty.
- [x] Header đổi sang hero centered rõ hơn.
- [x] Nền trang dùng radial/amber premium rõ hơn.
- [x] Summary cards đổi sang gold premium cards, khác hẳn card trắng cũ.
- [x] Panel Lịch học/Công tác/Vai trò dùng gradient trắng-kem, ring amber, shadow mềm.
- [x] Empty state và duty/study card đồng bộ tone premium.
- [ ] User apply và test pnpm check/test/build.
- [ ] Runtime /resident/today nhìn khác rõ so với bản cũ.
- [ ] Không vỡ layout, không scroll ngang.

---

## 2026-07-12 — 15C PASS

User xác nhận: `15C pass`.

Kết quả chốt:
- [x] User apply patch 15C.
- [x] Runtime `/resident/today` nhìn khác rõ so với bản cũ.
- [x] Hero/summary/panel portal today đạt yêu cầu premium hơn.
- [x] Không ghi nhận lỗi layout sau patch 15C.

Ghi chú:
- 15B được xem là polish nhẹ chưa đạt kỳ vọng thị giác.
- 15C là bản style portal today đang được chốt làm base tiếp theo.
- Các bước tiếp theo của Việc 15 phải patch trên base sau 15C nếu có đụng `ResidentToday.tsx`.


---

## Việc 15D — MyDuties / Công tác của tôi premium polish

**Trạng thái:** PATCH READY

### Mục tiêu
- Chuẩn hóa trang `/my-duties` / Công tác của tôi theo style portal premium đã chốt ở Việc 15C.
- Giữ nguyên logic công tác cá nhân/phòng/tổ/ban đã pass ở Việc 12C.
- Không đổi backend/API/schema/navigation.

### File patch
- `client/src/pages/MyDuties.tsx`

### Nội dung thay đổi
- Hero centered trắng/kem/amber, headline rõ hơn.
- Summary cards premium: Tổng công tác, Chưa làm, Hoàn thành.
- Thêm quick filter: Tất cả / Chưa làm / Hoàn thành / Khác.
- Danh sách công tác chuyển thành card compact, có nhãn scope và trạng thái.
- Nút hoàn thành gọn hơn, đồng bộ tone action.
- Empty/loading/error state theo style mới.

### Test cần chạy
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Resident mở trang Công tác của tôi không lỗi.
- [ ] Filter hoạt động đúng.
- [ ] Công tác cá nhân/phòng/tổ/ban vẫn hiển thị đúng.
- [ ] Nút Hoàn thành vẫn cập nhật trạng thái.
