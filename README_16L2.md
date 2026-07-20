# Việc 16L2 — Tạo ca trực Cửa hàng từ Công tác

Base:
- server/routers/modules/duties.ts
- server/db/duty.ts
- client/src/pages/DailyRoutine.tsx
- client/src/components/daily-routine/duties/DutiesTab.tsx
- client/src/components/daily-routine/duties/DutyAssignmentForm.tsx

Nội dung:
- Nhận diện mẫu công tác Trực cửa hàng theo dutyCode/dutyName.
- Chỉ cho phân công trực tiếp cho học viên.
- Chọn ca sáng/chiều, cửa hàng, người trực chính, tiền đầu ca.
- Ca sáng: nghiệp vụ 07:00–13:00, quyền dự kiến 07:00–14:00.
- Ca chiều: nghiệp vụ 13:00–18:00, quyền dự kiến 13:00–19:00.
- Khi lưu batch tự tạo dutyAssignments, storeDutyAssignments, storeDutyMembers và storeShifts.
- Chặn tạo trùng cùng cửa hàng/ngày/ca.
- Chưa cấp mã access; chưa bật menu Cửa hàng cho học viên.
- Không có migration mới; dùng schema 16L1 đã chạy.

Mẫu công tác nên có một trong các mã:
- STORE_SHIFT
- TRUC_CUA_HANG

Sau khi thay file:
pnpm check
pnpm dev
