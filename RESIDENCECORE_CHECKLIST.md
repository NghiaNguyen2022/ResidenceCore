# ResidenceCore / App Lưu Xá - Checklist cập nhật sau Việc 9

**Ngày cập nhật:** 2026-07-04  
**Trạng thái:** Việc 9 đã pass  
**Nguyên tắc:** Làm từng việc một; sau mỗi việc pass phải cập nhật checklist và PROJECT_SUMMARY.md.

---

## Tổng trạng thái Việc 1 -> Việc 9

| Việc | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Việc 1 | Đồng bộ Route / Menu / Page | ✅ Done / Pass | Menu không còn dẫn tới route 404; path chưa có route được disabled/ẩn có chủ đích. |
| Việc 2 | Phân loại page chưa vào route chính | ✅ Done | 33 page orphan đã phân loại Connect / Keep / Archive. |
| Việc 3 | Khóa main flow Học viên -> Phòng -> Tổ chức | ✅ Done / Pass | Đã guard legacy room endpoint, bổ sung RBAC rooms router, runtime pass. |
| Việc 4 | Khóa FinanceLite tối thiểu | ✅ Done / Pass | Đã guard RBAC finance router và DB finance rule; runtime pass. |
| Việc 5 | Khóa DailyRoutine / Công tác mức demo | ✅ Done / Pass | Đã guard RBAC duties router; manager/resident runtime pass. |
| Việc 6 | Review Resident Portal theo dữ liệu thật | ✅ Done / Pass | Đã guard active resident/user cho resident portal; runtime pass. |
| Việc 7 | Dọn test baseline | ✅ Done / Pass | Đã đổi `server/routers.test.ts` thành `server/routers.legacy.ts`; check/test/build pass. |
| Việc 8 | Definition of Done cho 5 module chính | ✅ Done | Đã tạo/cập nhật DoD cho Members, Rooms, Organization, DailyRoutine, FinanceLite. |
| Việc 9 | Chuẩn hóa helper / util / style | ✅ Done / Pass | Đã chuẩn hóa helper, TimePicker, DatePicker portal fix; check/test/build/runtime pass. |

---

## Chi tiết Việc 9 đã hoàn tất

### Patch 9A - Shared helper foundation

- Cập nhật `client/src/lib/format.ts`.
- Cập nhật `client/src/lib/utils.ts`.
- Chuẩn hóa helper tiền/ngày dùng chung.
- Điều chỉnh `client/src/components/finance-lite/financeLiteUtils.ts` để dùng helper nền, không đổi behavior FinanceLite.

### Patch 9B - TimePicker chuẩn hóa

- Tạo `client/src/components/shared/form/TimePickerInput.tsx`.
- Áp dụng picker giờ cho các khu vực DailyRoutine và StudySchedule.
- Giữ output `HH:mm`.
- Không để input time chỉ là text/input rời rạc.

### Patch 9C - DatePicker portal fix

- Cập nhật `client/src/components/shared/form/DatePickerInput.tsx`.
- Calendar render bằng portal/fixed để không bị cắt dưới trong modal/card/scroll container.
- Giữ behavior nhập/chọn ngày hiện tại.

### Runtime đã xác nhận pass

- `pnpm check` pass.
- `pnpm test` pass.
- `pnpm build` pass.
- FinanceLite không regression tiền/ngày.
- Members/Ngày sinh mở calendar đầy đủ, không bị cắt dưới.
- DailyRoutine/StudySchedule chọn giờ bằng picker ổn.

---

## Rule mới cần bảo vệ từ Việc 9

- Các input kiểu `date`, `time`, `datetime` phải có picker phù hợp.
- Không tạo input date/time chỉ nhập text thủ công.
- Nếu đã có shared component thì phải dùng lại:
  - `DatePickerInput`
  - `FormDateInput`
  - `TimePickerInput`
- Popup picker phải không bị cắt bởi modal/card/scroll container.
- Helper format tiền/ngày nên lấy từ shared lib trước khi tự viết trong page/component.

---

## Việc 10 - Cleanup docs / file thừa (sẵn sàng bắt đầu)

### Mục tiêu

Làm repo gọn, tài liệu không còn lệch trạng thái mới, không để file tạm/doc cũ gây nhiễu.

### Checklist dự kiến

- [ ] So sánh và merge `STYLE_SYNC_RULES.md` nếu bị trùng giữa root và `client/docs`.
- [ ] Xóa `.temp_tsc_out_utf8.txt` nếu chỉ là file tạm.
- [ ] Xóa `.temp_tsc_out.txt` nếu chỉ là file tạm.
- [ ] Rà các file `.docx` trong source:
  - `Trình-bày.docx`
  - `Trình-bày-Professional.docx`
  - `client/src/components/ResidenceCore-Business.docx`
- [ ] Nếu `.docx` cần giữ thì chuyển vào `docs/archive` hoặc nơi tài liệu phù hợp, không để lẫn trong source component.
- [ ] Cập nhật `PROJECT_SUMMARY.md` để phản ánh Việc 9 đã pass.
- [ ] Rà `02_API_DOCUMENTATION.md`, `03_DATABASE_SCHEMA.md`, `05_USER_MANUAL.md`, `ARCHITECTURE_DIAGRAM.md` xem phần nào còn quá cũ so với Simple Mode / FinanceLite / Resident Portal.
- [ ] Chốt danh sách tài liệu cần update sâu sau cleanup.

### File cần cho Việc 10

- `PROJECT_SUMMARY.md` bản mới nhất.
- `STYLE_SYNC_RULES.md`.
- `client/docs/STYLE_SYNC_RULES.md`.
- `.temp_tsc_out_utf8.txt` nếu còn.
- `.temp_tsc_out.txt` nếu còn.
- Các file `.docx` cần rà.
- `docs/*` hiện tại.

