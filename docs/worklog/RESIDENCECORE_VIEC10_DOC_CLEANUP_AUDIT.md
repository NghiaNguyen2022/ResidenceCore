# ResidenceCore - Việc 10 Audit: Cleanup docs / file thừa

## Mục tiêu

Làm repo gọn hơn, tránh tài liệu cũ gây hiểu nhầm và đảm bảo `PROJECT_SUMMARY.md` phản ánh trạng thái mới nhất sau Việc 1 → Việc 9.

## File đã audit

- `PROJECT_SUMMARY.md` / `PROJECT_SUMMARY_UPDATED_20260704.md`
- `PROJECT_SUMMARY_VIEC9_STATUS_APPEND.md`
- `README.md`
- `STYLE_SYNC_RULES.md`
- `02_API_DOCUMENTATION.md/pdf`
- `03_DATABASE_SCHEMA.md/pdf`
- `04_SETUP_DEPLOYMENT.md/pdf`
- `05_USER_MANUAL.md/pdf`
- `ARCHITECTURE_DIAGRAM.md`
- `.temp_tsc_out.txt`
- `.temp_tsc_out_utf8.txt`
- `Trình-bày.docx`
- `Trình-bày-Professional.docx`
- `ResidenceCore-Business.docx`

## Kết luận

### 1. `PROJECT_SUMMARY.md`

Cần cập nhật thêm trạng thái Việc 9 và Việc 10 audit. Bản cập nhật đã được chuẩn bị trong patch này.

### 2. `README.md`

README hiện còn là template kỹ thuật gốc, nên cần thay bằng README định hướng ResidenceCore/App Lưu Xá.

### 3. `STYLE_SYNC_RULES.md`

Giữ làm nguồn style rule chính. Bổ sung rule date/time/datetime picker.

### 4. Tài liệu cũ trong docs

Các tài liệu API/DB/User Manual/Architecture cũ có giá trị tham khảo nhưng chưa khớp trạng thái code hiện tại. Đề xuất chuyển vào `docs/legacy-manus-v1/` hoặc giữ nhưng đánh dấu legacy bằng `docs/DOCUMENTATION_STATUS.md`.

### 5. File tạm

`.temp_tsc_out*.txt` nên xóa khỏi repo.

### 6. File docx

Các file `.docx` là tài liệu trình bày/demo. Nếu còn cần giữ thì chuyển vào `docs/archive/presentation/`.

## Patch chuẩn bị

- `PROJECT_SUMMARY.md`
- `README.md`
- `STYLE_SYNC_RULES.md`
- `docs/DOCUMENTATION_STATUS.md`
- `docs/worklog/RESIDENCECORE_VIEC10_DOC_CLEANUP_AUDIT.md`
- `scripts/cleanup-docs-viec10.sh`

## Runtime/check sau apply

```bash
pnpm check
pnpm test
pnpm build
```

## Trạng thái

- Audit: done.
- Patch: ready.
- Chờ apply và xác nhận pass.
