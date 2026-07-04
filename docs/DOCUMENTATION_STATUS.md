# ResidenceCore Documentation Status

Tài liệu này ghi trạng thái tài liệu sau Việc 10 - Cleanup docs / file thừa.

## Nguồn hiện hành nên đọc trước

| File | Trạng thái | Ghi chú |
|---|---|---|
| `PROJECT_SUMMARY.md` | Current | Nguồn tổng hợp trạng thái, workflow và quyết định mới nhất. |
| `README.md` | Current | Tổng quan repo và quy tắc phát triển sau cleanup. |
| `STYLE_SYNC_RULES.md` | Current | Quy tắc UI/style, bao gồm rule date/time picker. |
| `docs/MODULE_DONE_DEFINITION.md` | Current nếu đã apply | Definition of Done cho Members, Rooms, Organization, DailyRoutine, FinanceLite. |

## Tài liệu legacy cần cập nhật sâu sau

| File | Đề xuất | Lý do |
|---|---|---|
| `01_PROJECT_OVERVIEW.pdf` | Chuyển `docs/legacy-manus-v1/` | Tài liệu trình bày cũ. |
| `02_API_DOCUMENTATION.md/pdf` | Chuyển legacy hoặc viết lại | Đang mô tả router/role cũ, chưa phản ánh FinanceLite, DailyRoutine, Resident Portal hiện tại. |
| `03_DATABASE_SCHEMA.md/pdf` | Chuyển legacy hoặc viết lại | Đang mô tả schema cũ, chưa chắc khớp Drizzle hiện tại. |
| `04_SETUP_DEPLOYMENT.md/pdf` | Giữ tham khảo/legacy | Có thể còn hữu ích cho setup, nhưng cần cập nhật script và đường dẫn thật. |
| `05_USER_MANUAL.md/pdf` | Viết lại sau | Đang dùng menu/role cũ, chưa phản ánh Simple Mode và flow hiện tại. |
| `ARCHITECTURE_DIAGRAM.md` | Cập nhật diagram sau | Diagram còn theo module cũ như Attendance/Tasks/Fees. |
| `Trình-bày*.docx`, `ResidenceCore-Business.docx` | Chuyển `docs/archive/presentation/` | Tài liệu trình bày/demo, không nên để rải trong source/runtime path. |

## File nên xóa khỏi source

- `.temp_tsc_out.txt`
- `.temp_tsc_out_utf8.txt`

Hai file này là output tạm của compile/typecheck, không nên commit.

## Nguyên tắc sau cleanup

- Tài liệu mô tả code phải bám code mới nhất.
- Tài liệu cũ không xóa ngay nếu còn giá trị tham khảo; chuyển vào `docs/legacy-manus-v1/` hoặc `docs/archive/`.
- Sau mỗi nhóm việc pass, cập nhật `PROJECT_SUMMARY.md` trước khi chuyển bước kế tiếp.
