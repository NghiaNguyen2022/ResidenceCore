# ResidenceCore / App Lưu Xá

ResidenceCore là ứng dụng quản lý lưu xá/nội trú dành cho người quản lý, học viên lưu trú và các vai trò tổ chức nội bộ. Dự án hiện tập trung vào Simple Mode: gọn, đủ nghiệp vụ, dễ vận hành hằng ngày.

## Trạng thái hiện tại

Các luồng chính đã được khóa và pass qua chuỗi Việc 1 → Việc 9:

- Route/Menu/Page đã đồng bộ để tránh 404 trong luồng chính.
- Main flow Học viên → Phòng → Tổ chức đã pass.
- FinanceLite tối thiểu đã pass: tạo kỳ/khoản thu, áp dụng, ghi nhận thanh toán, cập nhật tổng quan.
- DailyRoutine/Công tác mức demo đã pass.
- Resident Portal theo dữ liệu thật đã pass.
- Test baseline đã dọn: legacy helper không còn nằm dưới tên `.test.ts`.
- Definition of Done cho module chính đã được chốt.
- Shared helper/style foundation đã chuẩn hóa; date/time/datetime input phải dùng picker.

## Luồng code chuẩn

Frontend:

```txt
client/src/App.tsx
→ client/src/pages/*
→ client/src/components/*
→ client/src/lib/trpc.ts
```

Backend:

```txt
server/routers/modules/*
→ server/services/*
→ server/db/*
→ drizzle/schema.ts
```

## Module chính

- `Members` / `Rooms`: quản lý học viên, phòng ở, liên hệ gia đình, trạng thái lưu trú.
- `Organization`: tổ/ban, nhiệm kỳ, bổ nhiệm, cơ cấu hiện tại.
- `DailyRoutine`: hôm nay, lịch sinh hoạt, công tác/trực nhật, cập nhật trạng thái.
- `FinanceLite`: kỳ thu, khoản thu, thanh toán, tổng quan tài chính.
- `Resident Portal`: hồ sơ, hôm nay, công tác, tài chính cá nhân.

## Quy tắc bảo vệ khi phát triển

- Luôn làm trên file mới nhất đã được gửi/sửa trong phiên làm việc; không yêu cầu gửi lại cùng file nếu người dùng không nói đã chỉnh ngoài.
- Mỗi thay đổi phải giữ các flow đã pass, không revert fix cũ.
- Không thêm module mới trước khi flow chính ổn.
- Có menu thì phải có route thật hoặc disabled/ẩn có chủ đích.
- Input ngày/giờ/datetime phải dùng picker phù hợp, không chỉ nhập text thủ công.
- UI mới phải dùng `residenceMediumStyle`, `residenceAppearance`, `cx/cn` và helper shared.
- Sau mỗi nhóm việc pass, cập nhật checklist và `PROJECT_SUMMARY.md`.

## Scripts thường dùng

```bash
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Tài liệu nên đọc trước

- `PROJECT_SUMMARY.md`: trạng thái, quyết định nghiệp vụ, roadmap.
- `docs/DOCUMENTATION_STATUS.md`: tài liệu nào đang hiện hành, tài liệu nào là legacy.
- `docs/MODULE_DONE_DEFINITION.md` nếu đã áp dụng trong repo.
- `STYLE_SYNC_RULES.md`: quy tắc UI/style chung.

## Ghi chú tài liệu legacy

Các tài liệu cũ từ tháng 5/2026 như API docs, DB schema, user manual và diagram có thể chưa khớp code hiện tại. Không dùng chúng làm nguồn sự thật tuyệt đối nếu khác `PROJECT_SUMMARY.md` và code mới nhất.
