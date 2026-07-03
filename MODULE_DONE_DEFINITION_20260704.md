# ResidenceCore / App Lưu Xá — Module Definition of Done

**Ngày cập nhật:** 04/07/2026  
**Phạm vi:** áp dụng cho 5 module chính đã khóa main flow: Members, Rooms, Organization, DailyRoutine, FinanceLite.

## 1. Nguyên tắc Done chung

Một module chỉ được xem là “xong mức main flow” khi đạt đủ:

```txt
[ ] Có route thật hoặc được gọi từ route chính.
[ ] Menu vào được hoặc bị ẩn/disabled có chủ đích nếu chưa phục vụ demo.
[ ] Không phát sinh 404 trong luồng chính.
[ ] UI gọi đúng API hiện hành, không phụ thuộc endpoint legacy.
[ ] API có RBAC guard phù hợp.
[ ] Service/DB guard bảo vệ rule nghiệp vụ chính.
[ ] Có loading/error/empty state ở mức tối thiểu.
[ ] pnpm check pass.
[ ] pnpm test pass.
[ ] pnpm build pass.
[ ] Có runtime test theo user journey.
[ ] Nếu có thay đổi trạng thái nghiệp vụ, phải cập nhật checklist và PROJECT_SUMMARY.md.
```

## 2. Members — Definition of Done

```txt
[ ] Route /members chạy ổn.
[ ] Menu manager vào được.
[ ] Tạo học viên mới chạy đúng.
[ ] Cập nhật hồ sơ học viên chạy đúng.
[ ] Thêm/sửa/xóa liên hệ gia đình đúng residentId.
[ ] Action phòng không hiển thị sai với học viên đã rời/ngừng.
[ ] Action tổ chức mở đúng context học viên.
[ ] Rời/ngừng lưu xá khóa user liên kết nếu có.
[ ] Đăng ký lại không tự reuse phòng cũ.
[ ] UI dùng style foundation, không thêm style ad-hoc lớn.
[ ] check/test/build pass.
```

## 3. Rooms — Definition of Done

```txt
[ ] Gán phòng cho học viên chưa có phòng.
[ ] Chặn gán phòng nếu học viên đã có phòng.
[ ] Chặn gán/chuyển nếu phòng đầy.
[ ] Chặn chuyển cùng phòng.
[ ] Chuyển phòng đóng assignment cũ và mở assignment mới.
[ ] Trả phòng đóng assignment hiện tại.
[ ] currentRoomId là nguồn hiện trạng chính.
[ ] roomAssignments giữ lịch sử truy vết.
[ ] Mutation quản lý phòng có RBAC guard.
[ ] check/test/build pass.
```

## 4. Organization — Definition of Done

```txt
[ ] Route /organization chạy ổn.
[ ] Xem được cơ cấu hiện tại.
[ ] Bổ nhiệm chức vụ hoạt động đúng.
[ ] Tổ trưởng được scope theo từng Tổ.
[ ] Trưởng ban được scope theo từng Ban.
[ ] Fixed roles như Trưởng/Phó/Thư ký/Thủ quỹ không bị duplicate sai.
[ ] Unit membership giữ đúng sau thêm/đổi Tổ/Ban.
[ ] OrgChart giữ layout đã chốt.
[ ] Học viên rời/ngừng có active appointment thì phải xử lý bàn giao/confirm đúng flow.
[ ] check/test/build pass.
```

## 5. DailyRoutine — Definition of Done

```txt
[ ] Route /daily-routine là điểm vào chính cho sinh hoạt/công tác.
[ ] Có tab Hôm nay.
[ ] Có tab Lịch sinh hoạt.
[ ] Có tab Công tác.
[ ] Tạo được mẫu lịch.
[ ] Tạo được công tác.
[ ] Preview phân công chạy được.
[ ] Ghi phân công chạy được.
[ ] Cập nhật trạng thái hoàn thành/vắng/hủy chạy được.
[ ] Cancel rồi reassign được.
[ ] Resident chỉ cập nhật công tác của mình qua MyDuties.
[ ] Endpoint quản lý duties có RBAC guard.
[ ] Không mở Smart Assignment nâng cao trong demo chính.
[ ] check/test/build pass.
```

## 6. FinanceLite — Definition of Done

```txt
[ ] Route /finance vào đúng FinanceLite.
[ ] Tạo kỳ thu/khoản thu chạy được.
[ ] Áp dụng khoản thu cho học viên chạy được.
[ ] Không sinh khoản thu cho học viên rời/ngừng.
[ ] Không tạo amount <= 0.
[ ] Không tạo trùng khoản thu cùng kỳ/tháng/học viên/item.
[ ] Ghi nhận thanh toán chạy được.
[ ] Không cho thu vượt số còn lại.
[ ] Thanh toán một phần cập nhật partial.
[ ] Thanh toán đủ cập nhật paid.
[ ] Tổng quan tài chính cập nhật đúng sau apply/payment/cancel.
[ ] Finance router có RBAC guard.
[ ] check/test/build pass.
```

## 7. Trạng thái hiện tại

Theo chuỗi việc đã pass:

```txt
Việc 1 — Route/Menu/Page: Done / Pass
Việc 2 — Page orphan audit: Done
Việc 3 — Members/Rooms/Organization main flow: Done / Pass
Việc 4 — FinanceLite minimum flow: Done / Pass
Việc 5 — DailyRoutine demo flow: Done / Pass
Việc 6 — Resident Portal: Done / Pass
Việc 7 — Test baseline: Done / Pass
Việc 8 — Definition of Done: Done
```

## 8. Cách dùng tài liệu này

- Dùng tài liệu này làm gate trước khi gọi một module là “xong”.
- Nếu module có thêm feature mới, phải chạy lại checklist DoD liên quan.
- Nếu sửa business rule, phải cập nhật lại `PROJECT_SUMMARY.md`.
- Nếu sửa route/menu, phải kiểm tra lại không phát sinh 404.
