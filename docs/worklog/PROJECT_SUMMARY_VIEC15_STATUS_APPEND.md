# PROJECT_SUMMARY — Việc 15 Status Append

> Append-only status log cho Việc 15 — Portal học viên mở rộng / gom trải nghiệm học viên.

## Mục tiêu Việc 15

Gom trải nghiệm Portal học viên để học viên đăng nhập và thấy các phần liên quan đến mình: hôm nay, hồ sơ, công tác, tài chính, thông báo, hoạt động công khai và quyền theo chức vụ nếu có.

## Log cập nhật

### 15A — Portal activities route

Đã audit portal và bổ sung route `/resident/activities` để menu Hoạt động không rơi vào NotFound. Trạng thái: đã patch.

### 15B — Portal Today polish nhẹ

Đã thử polish nhẹ trang Hôm nay nhưng style chưa thay đổi rõ. Không chốt pass.

### 15C — Portal Today visible premium restyle

Đã restyle mạnh hơn cho `ResidentToday.tsx`: hero centered, nền trắng/kem/amber, summary cards premium, panel lịch học/công tác/vai trò đồng bộ hơn. User xác nhận PASS.

### 15D — MyDuties polish

Đã polish `MyDuties.tsx` nhưng sau đó phát hiện trang Công tác chưa hiện rõ trong menu portal. Không chốt pass; cần gom menu trước.

### 15E — Gọn menu Portal học viên

Đã rút gọn menu portal bước đầu nhưng user phản hồi vẫn còn rời rạc.

### 15F — Gom tiếp menu Portal học viên

Đã gom menu học viên thường về 2 điểm vào chính: `Hôm nay` và `Lưu xá của tôi`. Nhóm `Lưu xá của tôi` chứa Hồ sơ, Công tác, Tài chính, Thông báo, Hoạt động. Học viên có chức vụ có thêm nhóm `Phụ trách` với Tổng quan, Điều hành, Tổ phụ trách, Ban phụ trách. User xác nhận PASS.

## Trạng thái hiện tại

Việc 15 đang tiếp tục. Trạng thái mới nhất: 15F PASS.

## Bước tiếp theo

15G — Chuẩn hóa trang Công tác trong menu mới, đảm bảo style đồng bộ với Portal Today 15C và giữ logic cá nhân/phòng/tổ/ban đã pass ở Việc 12C.

### 15G — Chuẩn hóa trang Công tác trong menu mới

Đã chuẩn hóa `MyDuties.tsx` theo menu mới `Lưu xá của tôi > Công tác`. Trang dùng style cùng hệ với Portal Today 15C, đồng thời giữ logic công tác cá nhân/phòng/tổ/ban đã pass ở Việc 12C. User xác nhận DONE/PASS.

### 15H — Rà Tài chính của tôi trong Portal

Audit `ResidentFinance.tsx`: trang tài chính học viên đã khá đầy đủ và có style premium tương đối tốt. Phát hiện modal cập nhật thực chi tạm ứng còn dùng input date thô, trái rule picker toàn hệ thống. Patch 15H đổi `Ngày chi` sang `FormDateInput` shared, không đổi backend/API/schema/logic tài chính. Trạng thái: đã patch, chờ test.

---

## 2026-07-12 — Việc 15I PASS: Resident Finance currency input

User confirmed `15I pass`.

Việc 15I completed:
- Resident Finance advance spending amount input now formats money while typing using Vietnamese separator style.
- `1000000` is displayed as `1.000.000`.
- Submitted value remains numeric for backend compatibility.
- No backend/API/schema changes.
- Kept date picker rule from 15H intact.

Việc 15 current state:
- 15A Portal Activities route: patched.
- 15C Portal Today premium restyle: PASS.
- 15F Resident Portal menu regroup: PASS.
- 15G MyDuties/Công tác in menu: done/pass by user flow.
- 15H Resident Finance DatePicker fix: patched.
- 15I Resident Finance currency input: PASS.

Next suggested step:
- 15J: Review/polish remaining resident portal pages, especially public activities and final portal demo flow.

---

## 2026-07-12 — Việc 15J: Portal remaining pages premium polish

Context:
- After 15F menu regroup and 15I finance currency input pass, the remaining portal pages should be visually aligned before final portal demo closure.
- Scope is intentionally limited to portal-facing Activities and Information pages.

Patch summary:
- `ResidentActivities.tsx`: restyled with FinanceLite-style page shell, premium summary cards, amber/cream filter panel, compact activity cards, and pill filters instead of dropdown to avoid overlay layout issues.
- `ResidentInformation.tsx`: restyled into the same portal premium system with centered header, guidance cards, demo CTA and less scattered multi-tone cards.

No changes:
- No backend/API/schema changes.
- No navigation changes after 15F.
- No finance/duty/notification logic changes.

Pending:
- Apply patch, run `pnpm check`, `pnpm test`, `pnpm build`.
- Runtime test `/resident/activities` and `/resident/information`.

