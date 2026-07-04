# ResidenceCore Checklist - Việc 10 Cleanup docs / file thừa

## Trạng thái

- Việc 1 → Việc 9: Done / Pass.
- Việc 10: Audit done, patch ready, chờ apply.

## Checklist Việc 10

```txt
[x] Dùng PROJECT_SUMMARY.md bản mới nhất đã có, không yêu cầu gửi lại.
[x] Audit README.md.
[x] Audit STYLE_SYNC_RULES.md.
[x] Audit docs cũ: API, DB schema, setup/deployment, user manual, architecture.
[x] Audit file tạm .temp_tsc_out*.txt.
[x] Audit file .docx trình bày.
[x] Chuẩn bị PROJECT_SUMMARY.md cập nhật sau Việc 9 và Việc 10 audit.
[x] Chuẩn bị README.md mới theo ResidenceCore/App Lưu Xá.
[x] Chuẩn bị STYLE_SYNC_RULES.md có rule date/time picker.
[x] Chuẩn bị docs/DOCUMENTATION_STATUS.md.
[x] Chuẩn bị script cleanup-docs-viec10.sh.
[ ] Apply patch trong repo thật.
[ ] Chạy pnpm check.
[ ] Chạy pnpm test.
[ ] Chạy pnpm build.
[ ] Xác nhận Việc 10 pass.
```

## Lưu ý

Script cleanup không bắt buộc chạy nếu muốn di chuyển/xóa file thủ công. Nếu chạy script, nên xem lại `git diff` trước khi commit.
