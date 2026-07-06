# PROJECT_SUMMARY append — Việc 12B

> Ghi thêm vào PROJECT_SUMMARY.md, không thay thế nội dung cũ.

## 2026-07-04 — Việc 12B: Organization assignment modal error placement

- Context: Trong modal `Bổ nhiệm / Phân công`, khi thiếu học viên hoặc lưu lỗi, message đang render ở page phía sau modal nên người dùng khó thấy.
- Patch: cập nhật `client/src/pages/OrganizationSimple.tsx`.
- Thay đổi chính:
  - thêm state `assignmentFormError` cho riêng form bổ nhiệm/phân công;
  - lỗi validate `Vui lòng chọn học viên` hiển thị ngay trong modal;
  - lỗi API khi lưu bổ nhiệm cũng hiển thị ngay trong modal;
  - clear lỗi khi mở/đóng/lưu thành công;
  - không đổi API, service, business rule, OrgChart layout.
- Runtime cần test:
  - mở Bổ nhiệm / Phân công, không chọn học viên, bấm Lưu → lỗi nằm trong modal;
  - lỗi lưu từ server cũng nằm trong modal;
  - lưu thành công đóng modal và refresh dữ liệu như cũ.
