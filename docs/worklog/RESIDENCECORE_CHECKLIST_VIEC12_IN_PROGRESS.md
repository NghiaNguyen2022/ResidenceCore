# RESIDENCECORE_CHECKLIST_VIEC12_IN_PROGRESS

## Việc 12 — Organization + Công tác + Portal theo chức vụ

### 12A — Guard/scope/portal integration
- [x] Audit Organization/Duties/Portal theo kịch bản demo
- [x] Patch guard/scope cho router/db/portal duty
- [ ] User xác nhận pass runtime

### 12B — Modal validation feedback
- [x] Audit lỗi thông báo bổ nhiệm bị hiện dưới page khi modal đang mở
- [x] Chuyển lỗi validate/lưu bổ nhiệm vào trong modal Bổ nhiệm / Phân công
- [x] Không đổi business logic bổ nhiệm
- [x] Không đổi OrgChart layout
- [ ] User apply và chạy pnpm check/test/build
- [ ] Runtime: bỏ trống học viên → lỗi nằm trong form modal
- [ ] Runtime: lỗi API khi lưu bổ nhiệm → lỗi nằm trong form modal
